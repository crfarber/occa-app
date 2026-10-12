/**
 * Maps on-device classifier labels (custom TFLite category names or ML Kit base labels)
 * to a local product draft. Only specific labels count; generic ones like "Clothing"
 * or "Fashion" leave fields unknown rather than inventing values.
 */

export const PRODUCT_CATEGORIES = [
  'top',
  'broek',
  'schoenen',
  'tas',
  'jas',
  'rok',
  'jurk',
  'trui_vest',
] as const;
export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export const PATTERNS = [
  'effen',
  'gestreept',
  'geruit',
  'bloemen',
  'print',
  'dessin',
  'anders',
] as const;
export type Pattern = (typeof PATTERNS)[number];

export type RawLabel = {
  text: string;
  confidence: number;
};

export type CategoryGuess =
  { kind: 'known'; category: ProductCategory; score: number } | { kind: 'unknown' };

export type PatternGuess = { kind: 'known'; pattern: Pattern; score: number } | { kind: 'unknown' };

export const UNCERTAIN_FIELDS = ['category', 'colors', 'pattern', 'subtype'] as const;
export type UncertainField = (typeof UNCERTAIN_FIELDS)[number];

/** Local concept fill from on-device labels. Empty fields stay empty; nothing is invented. */
export type InterpretLabelsResult = {
  category: CategoryGuess;
  colors: string[];
  pattern: PatternGuess;
  subtype: string | null;
  labels: RawLabel[];
  uncertainFields: UncertainField[];
};

/** Custom int8 model scores softer than the ML Kit base model; keep the floor low. */
const CATEGORY_THRESHOLD = 0.2;
const COLOR_THRESHOLD = 0.4;
const PATTERN_THRESHOLD = 0.4;
const MAX_COLORS = 3;

const LABEL_TO_CATEGORY: Record<string, ProductCategory> = {
  shirt: 'top',
  't-shirt': 'top',
  't shirt': 'top',
  tshirt: 'top',
  tee: 'top',
  'tee shirt': 'top',
  'polo shirt': 'top',
  polo: 'top',
  'dress shirt': 'top',
  'button-up': 'top',
  'button up': 'top',
  'active shirt': 'top',
  top: 'top',
  tank: 'top',
  'tank top': 'top',
  tunic: 'top',
  jersey: 'top',
  blouse: 'top',
  longsleeve: 'top',
  'long sleeve': 'top',
  undershirt: 'top',
  jeans: 'broek',
  pants: 'broek',
  trousers: 'broek',
  shorts: 'broek',
  shoe: 'schoenen',
  shoes: 'schoenen',
  footwear: 'schoenen',
  sneaker: 'schoenen',
  sneakers: 'schoenen',
  boot: 'schoenen',
  boots: 'schoenen',
  sandal: 'schoenen',
  handbag: 'tas',
  bag: 'tas',
  purse: 'tas',
  backpack: 'tas',
  luggage: 'tas',
  jacket: 'jas',
  coat: 'jas',
  blazer: 'jas',
  outerwear: 'jas',
  /** Dataset spelling for outerwear in the clothing-dataset labels. */
  outwear: 'jas',
  raincoat: 'jas',
  windbreaker: 'jas',
  parka: 'jas',
  'denim jacket': 'jas',
  'leather jacket': 'jas',
  skirt: 'rok',
  dress: 'jurk',
  jumpsuit: 'jurk',
  romper: 'jurk',
  sweater: 'trui_vest',
  sweatshirt: 'trui_vest',
  hoodie: 'trui_vest',
  cardigan: 'trui_vest',
  jumper: 'trui_vest',
  pullover: 'trui_vest',
  fleece: 'trui_vest',
  chino: 'broek',
  leggings: 'broek',
  legging: 'broek',
  sweatpants: 'broek',
  overalls: 'broek',
  dungarees: 'broek',
  heel: 'schoenen',
  heels: 'schoenen',
  sandals: 'schoenen',
  loafer: 'schoenen',
  'ankle boot': 'schoenen',
  clutch: 'tas',
  tote: 'tas',
};

/** English ML Kit color labels → Dutch names used in the shop schema. */
const LABEL_TO_COLOR: Record<string, string> = {
  black: 'zwart',
  white: 'wit',
  gray: 'grijs',
  grey: 'grijs',
  silver: 'zilver',
  red: 'rood',
  pink: 'roze',
  orange: 'oranje',
  yellow: 'geel',
  green: 'groen',
  blue: 'blauw',
  'navy blue': 'donkerblauw',
  navy: 'donkerblauw',
  purple: 'paars',
  violet: 'paars',
  brown: 'bruin',
  beige: 'beige',
  tan: 'camel',
  gold: 'goud',
  khaki: 'khaki',
  turquoise: 'turquoise',
  teal: 'petrol',
  maroon: 'bordeaux',
  cream: 'creme',
};

/** Unique Dutch colour names for the result form dropdown. */
export const COLOR_OPTIONS: readonly string[] = [...new Set(Object.values(LABEL_TO_COLOR))].sort(
  (a, b) => a.localeCompare(b, 'nl'),
);

const LABEL_TO_PATTERN: Record<string, Pattern> = {
  stripe: 'gestreept',
  striped: 'gestreept',
  stripes: 'gestreept',
  plaid: 'geruit',
  check: 'geruit',
  checked: 'geruit',
  tartan: 'geruit',
  floral: 'bloemen',
  flower: 'bloemen',
  flowers: 'bloemen',
  print: 'print',
  pattern: 'dessin',
};

/**
 * Specific labels → subtype for the result form.
 * Aligns with training leaf names in training/categories.json where possible.
 */
const LABEL_TO_SUBTYPE: Record<string, string> = {
  // Tops
  't-shirt': 't-shirt',
  't shirt': 't-shirt',
  tshirt: 't-shirt',
  tee: 't-shirt',
  'tee shirt': 't-shirt',
  polo: 'polo',
  'polo shirt': 'polo',
  shirt: 'overhemd',
  'dress shirt': 'overhemd',
  'button-up': 'overhemd',
  'button up': 'overhemd',
  blouse: 'blouse',
  jersey: 'jersey',
  'tank top': 'tanktop',
  tank: 'tanktop',
  tunic: 'tuniek',
  'crop top': 'crop top',
  longsleeve: 'longsleeve',
  'long sleeve': 'longsleeve',
  undershirt: 'hemd',
  // Knitwear
  hoodie: 'hoodie',
  cardigan: 'vest',
  sweater: 'trui',
  sweatshirt: 'sweater',
  jumper: 'trui',
  pullover: 'trui',
  fleece: 'fleece',
  // Outerwear
  jacket: 'jas',
  coat: 'mantel',
  blazer: 'blazer',
  outerwear: 'jas',
  outwear: 'jas',
  raincoat: 'regenjas',
  windbreaker: 'regenjas',
  parka: 'winterjas',
  'denim jacket': 'spijkerjas',
  'leather jacket': 'leren jas',
  // Bottoms
  jeans: 'jeans',
  chino: 'chino',
  pants: 'pantalon',
  trousers: 'pantalon',
  shorts: 'short',
  leggings: 'legging',
  legging: 'legging',
  sweatpants: 'joggingbroek',
  overalls: 'overall',
  dungarees: 'tuinbroek',
  // Skirt / dress
  skirt: 'rok',
  dress: 'jurk',
  jumpsuit: 'jumpsuit',
  romper: 'playsuit',
  // Shoes
  shoes: 'schoenen',
  sneaker: 'sneaker',
  sneakers: 'sneaker',
  boot: 'laars',
  boots: 'laars',
  'ankle boot': 'enkellaars',
  sandal: 'sandaal',
  sandals: 'sandaal',
  heel: 'pump',
  heels: 'pump',
  pump: 'pump',
  loafer: 'instapper',
  moccasin: 'instapper',
  // Bags
  backpack: 'rugzak',
  purse: 'portemonnee',
  handbag: 'handtas',
  clutch: 'clutch',
  tote: 'shopper',
  // Accessories
  'baseball cap': 'pet',
  cap: 'pet',
  hat: 'hoed',
  beanie: 'muts',
  scarf: 'sjaal',
  belt: 'riem',
  sunglasses: 'zonnebril',
  tie: 'das',
  gloves: 'handschoenen',
};

/** Unique subtype values for the result form dropdown. */
export const SUBTYPE_OPTIONS: readonly string[] = [
  ...new Set(Object.values(LABEL_TO_SUBTYPE)),
].sort((a, b) => a.localeCompare(b, 'nl'));

function normalizeLabel(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, ' ');
}

function categoryForLabel(text: string): ProductCategory | null {
  const normalized = normalizeLabel(text);
  const direct = LABEL_TO_CATEGORY[normalized];
  if (direct !== undefined) {
    return direct;
  }
  // Compact form: "T-Shirt" / "t shirt" → "tshirt"
  const compact = normalized.replace(/[\s-]/g, '');
  for (const [key, category] of Object.entries(LABEL_TO_CATEGORY)) {
    if (key.replace(/[\s-]/g, '') === compact) {
      return category;
    }
  }
  return null;
}

function colorForLabel(text: string): string | null {
  return LABEL_TO_COLOR[normalizeLabel(text)] ?? null;
}

function patternForLabel(text: string): Pattern | null {
  return LABEL_TO_PATTERN[normalizeLabel(text)] ?? null;
}

function subtypeForLabel(text: string): string | null {
  return LABEL_TO_SUBTYPE[normalizeLabel(text)] ?? null;
}

function pickCategory(labels: RawLabel[]): CategoryGuess {
  const bestByCategory = new Map<ProductCategory, number>();
  for (const label of labels) {
    const category = categoryForLabel(label.text);
    if (category === null || label.confidence < CATEGORY_THRESHOLD) {
      continue;
    }
    const previous = bestByCategory.get(category);
    if (previous === undefined || label.confidence > previous) {
      bestByCategory.set(category, label.confidence);
    }
  }

  if (bestByCategory.size === 0) {
    return { kind: 'unknown' };
  }

  // Base models often score a tee as Jacket higher than Shirt — prefer the top.
  const topScore = bestByCategory.get('top');
  if (topScore !== undefined && bestByCategory.has('jas')) {
    return { kind: 'known', category: 'top', score: topScore };
  }

  let best: { category: ProductCategory; score: number } | null = null;
  for (const [category, score] of bestByCategory) {
    if (best === null || score > best.score) {
      best = { category, score };
    }
  }
  return best === null ? { kind: 'unknown' } : { kind: 'known', ...best };
}

function pickColors(labels: RawLabel[]): string[] {
  const scored: { color: string; score: number }[] = [];
  for (const label of labels) {
    const color = colorForLabel(label.text);
    if (color === null || label.confidence < COLOR_THRESHOLD) {
      continue;
    }
    scored.push({ color, score: label.confidence });
  }
  scored.sort((a, b) => b.score - a.score);
  const colors: string[] = [];
  for (const entry of scored) {
    if (colors.includes(entry.color)) {
      continue;
    }
    colors.push(entry.color);
    if (colors.length >= MAX_COLORS) {
      break;
    }
  }
  return colors;
}

function pickPattern(labels: RawLabel[]): PatternGuess {
  let best: { pattern: Pattern; score: number } | null = null;
  for (const label of labels) {
    const pattern = patternForLabel(label.text);
    if (pattern === null || label.confidence < PATTERN_THRESHOLD) {
      continue;
    }
    if (best === null || label.confidence > best.score) {
      best = { pattern, score: label.confidence };
    }
  }
  return best === null ? { kind: 'unknown' } : { kind: 'known', ...best };
}

function pickSubtype(labels: RawLabel[], category: CategoryGuess): string | null {
  let best: { subtype: string; score: number } | null = null;
  for (const label of labels) {
    const subtype = subtypeForLabel(label.text);
    if (subtype === null || label.confidence < CATEGORY_THRESHOLD) {
      continue;
    }
    // Only subtypes that belong to the chosen category (Hat must not win on a tee).
    if (category.kind === 'known') {
      const labelCategory = categoryForLabel(label.text);
      if (labelCategory !== category.category) {
        continue;
      }
    }
    if (best === null || label.confidence > best.score) {
      best = { subtype, score: label.confidence };
    }
  }
  return best?.subtype ?? null;
}

function uncertainFieldsFor(draft: {
  category: CategoryGuess;
  colors: string[];
  pattern: PatternGuess;
  subtype: string | null;
}): UncertainField[] {
  const fields: UncertainField[] = [];
  if (draft.category.kind === 'unknown') {
    fields.push('category');
  }
  if (draft.colors.length === 0) {
    fields.push('colors');
  }
  if (draft.pattern.kind === 'unknown') {
    fields.push('pattern');
  }
  if (draft.subtype === null) {
    fields.push('subtype');
  }
  return fields;
}

/**
 * Builds a local draft from ML Kit labels. Unmapped labels stay in `labels` for the UI
 * but do not invent category, color, or pattern.
 */
export function interpretLabels(labels: RawLabel[]): InterpretLabelsResult {
  const category = pickCategory(labels);
  const colors = pickColors(labels);
  const pattern = pickPattern(labels);
  const subtype = pickSubtype(labels, category);

  return {
    category,
    colors,
    pattern,
    subtype,
    labels,
    uncertainFields: uncertainFieldsFor({ category, colors, pattern, subtype }),
  };
}
