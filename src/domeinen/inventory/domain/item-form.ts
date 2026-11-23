/** Fields the form reads from a loaded item (no api-layer import). */
export type ItemDetailFields = {
  category: string | null;
  doelgroep: string | null;
  size: string | null;
  colour: string | null;
  brand: string | null;
  description: string | null;
  priceCents: number | null;
  location: string | null;
  sport: boolean;
  typeKeywords: string[];
};

export type ItemFormState = {
  category: string | null;
  doelgroep: string | null;
  size: string | null;
  colour: string | null;
  brand: string;
  description: string;
  priceText: string;
  location: string;
  sport: boolean;
  typeKeywordsText: string;
};

/** Only changed fields; mirrors the shop PATCH body. */
export type ItemPatchFields = {
  category?: string | null;
  doelgroep?: string | null;
  size?: string | null;
  colour?: string | null;
  brand?: string | null;
  description?: string | null;
  priceCents?: number | null;
  location?: string | null;
  sport?: boolean;
  typeKeywords?: string[];
};

export type ItemPatchErrorKey =
  | 'inventoryItem.errors.changedMeanwhile'
  | 'inventoryItem.errors.missingFields'
  | 'inventoryItem.errors.priceLocked'
  | 'inventoryItem.errors.invalidPrice'
  | 'inventoryItem.errors.sizeUnreadable'
  | 'inventoryItem.errors.notEditable'
  | 'inventoryItem.errors.noRight'
  | 'inventoryItem.errors.rolledBack'
  | 'inventoryItem.errors.saveFailed';

/** Cents → what the volunteer types ("12,50"). */
export function centsToPriceText(cents: number | null): string {
  if (cents === null) return '';
  return (cents / 100).toFixed(2).replace('.', ',');
}

/** Dutch/English price text → cents, or null when blank/invalid. */
export function priceTextToCents(input: string): number | null {
  const cleaned = input.trim().replace(/^€\s*/, '').replace(/\s/g, '');
  if (cleaned === '') return null;
  const match = /^(\d+)(?:[.,](\d{1,2}))?$/.exec(cleaned);
  if (match === null || match[1] === undefined) return null;
  const whole = Number(match[1]);
  const fraction = match[2] === undefined ? 0 : Number(match[2].padEnd(2, '0'));
  if (!Number.isSafeInteger(whole)) return null;
  return whole * 100 + fraction;
}

export function formFromDetail(detail: ItemDetailFields): ItemFormState {
  return {
    category: detail.category,
    doelgroep: detail.doelgroep,
    size: detail.size,
    colour: detail.colour,
    brand: detail.brand ?? '',
    description: detail.description ?? '',
    priceText: centsToPriceText(detail.priceCents),
    location: detail.location ?? '',
    sport: detail.sport,
    typeKeywordsText: detail.typeKeywords.join(', '),
  };
}

function keywordsFromText(text: string): string[] {
  return text
    .split(/[,;\n]/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

function emptyToNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

/** Only fields that differ from the loaded detail. */
export function buildItemPatch(detail: ItemDetailFields, form: ItemFormState): ItemPatchFields {
  const patch: ItemPatchFields = {};

  if (form.category !== detail.category) patch.category = form.category;
  if (form.doelgroep !== detail.doelgroep) patch.doelgroep = form.doelgroep;
  if (form.size !== detail.size) patch.size = form.size;
  if (form.colour !== detail.colour) patch.colour = form.colour;

  const brand = emptyToNull(form.brand);
  if (brand !== detail.brand) patch.brand = brand;

  const description = emptyToNull(form.description);
  if (description !== detail.description) patch.description = description;

  const location = emptyToNull(form.location);
  if (location !== detail.location) patch.location = location;

  if (form.sport !== detail.sport) patch.sport = form.sport;

  const keywords = keywordsFromText(form.typeKeywordsText);
  const sameKeywords =
    keywords.length === detail.typeKeywords.length &&
    keywords.every((word, index) => word === detail.typeKeywords[index]);
  if (!sameKeywords) patch.typeKeywords = keywords;

  const priceCents = priceTextToCents(form.priceText);
  const originalText = centsToPriceText(detail.priceCents);
  if (form.priceText.trim() !== originalText) {
    patch.priceCents = priceCents;
  }

  return patch;
}

const CODE_TO_KEY = {
  changed_meanwhile: 'inventoryItem.errors.changedMeanwhile',
  missing_fields: 'inventoryItem.errors.missingFields',
  price_locked: 'inventoryItem.errors.priceLocked',
  invalid_price: 'inventoryItem.errors.invalidPrice',
  size_unreadable: 'inventoryItem.errors.sizeUnreadable',
  not_editable: 'inventoryItem.errors.notEditable',
  no_right: 'inventoryItem.errors.noRight',
  rolled_back: 'inventoryItem.errors.rolledBack',
} as const satisfies Record<string, ItemPatchErrorKey>;

/** Map a PATCH error body (or empty object) to an i18n key. */
export function describeItemPatchFailure(
  body: { code?: string } | null | undefined,
): ItemPatchErrorKey {
  const code = body?.code;
  if (code !== undefined && code in CODE_TO_KEY) {
    return CODE_TO_KEY[code as keyof typeof CODE_TO_KEY];
  }
  return 'inventoryItem.errors.saveFailed';
}
