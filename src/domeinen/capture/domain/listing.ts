/**
 * The product card on the shop website. The photo does not supply these values, so they start
 * empty and the employee fills them in after the scan. Nothing here is guessed from the labels.
 */

export const LISTING_FIELDS = [
  'brand',
  'price',
  'description',
  'category',
  'subcategory',
  'color',
  'audience',
  'size',
  'shopSpot',
  'number',
] as const;

export type ListingField = (typeof LISTING_FIELDS)[number];

export type ListingDraft = Record<ListingField, string>;

const SUMMARY_FIELDS = [
  'category',
  'subcategory',
  'color',
  'size',
  'number',
] as const satisfies readonly ListingField[];

export function emptyListing(): ListingDraft {
  return {
    brand: '',
    price: '',
    description: '',
    category: '',
    subcategory: '',
    color: '',
    audience: '',
    size: '',
    shopSpot: '',
    number: '',
  };
}

export function applyListingPatch(
  listing: ListingDraft,
  patch: Partial<ListingDraft>,
): ListingDraft {
  return { ...listing, ...patch };
}

/** Short line for the scan list. Null while the employee has not filled anything in yet. */
export function listingSummary(listing: ListingDraft): string | null {
  const parts: string[] = [];
  for (const field of SUMMARY_FIELDS) {
    const value = listing[field].trim();
    if (value !== '') {
      parts.push(value);
    }
  }
  return parts.length === 0 ? null : parts.join(' · ');
}
