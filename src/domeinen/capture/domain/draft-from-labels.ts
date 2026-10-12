import {
  COLOR_OPTIONS,
  PATTERNS,
  PRODUCT_CATEGORIES,
  SUBTYPE_OPTIONS,
  type InterpretLabelsResult,
  type Pattern,
  type ProductCategory,
} from './interpret-labels';
import type { ListingDraft } from './listing';

export { COLOR_OPTIONS, PATTERNS, PRODUCT_CATEGORIES, SUBTYPE_OPTIONS };

/** Editable fields on the result screen before the scan is saved. */
export type ResultFormDraft = {
  category: ProductCategory | '';
  color: string;
  subcategory: string;
  pattern: Pattern | '';
};

/** Seeds the form from on-device recognition. Empty strings mean “not chosen yet”. */
export function formDraftFromLabels(result: InterpretLabelsResult): ResultFormDraft {
  return {
    category: result.category.kind === 'known' ? result.category.category : '',
    color: result.colors[0] ?? '',
    subcategory: result.subtype ?? '',
    pattern: result.pattern.kind === 'known' ? result.pattern.pattern : '',
  };
}

/**
 * Fills colour from a pixel sample only when ML Kit left it empty.
 * Does not override a colour the employee or the labeler already set.
 */
export function applyPixelColor(
  draft: ResultFormDraft,
  pixelColor: string | null,
): ResultFormDraft {
  if (draft.color !== '' || pixelColor === null || pixelColor === '') {
    return draft;
  }
  return { ...draft, color: pixelColor };
}

/**
 * Listing fields persisted on save. Pattern is form-only until the website model has a field.
 */
export function listingFromForm(draft: ResultFormDraft): Partial<ListingDraft> {
  return {
    category: draft.category,
    color: draft.color,
    subcategory: draft.subcategory,
  };
}

/** Convenience: ML result → listing patch without an intermediate form. */
export function listingFromLabels(result: InterpretLabelsResult): Partial<ListingDraft> {
  return listingFromForm(formDraftFromLabels(result));
}
