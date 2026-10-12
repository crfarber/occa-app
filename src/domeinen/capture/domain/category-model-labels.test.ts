import { describe, expect, it } from 'vitest';
import { CATEGORY_MODEL_LABELS, textForCategoryIndex } from './category-model-labels';

describe('textForCategoryIndex', () => {
  it('maps known indexes to training labels', () => {
    expect(textForCategoryIndex(0)).toBe('Blazer');
    expect(textForCategoryIndex(12)).toBe('T-Shirt');
    expect(textForCategoryIndex(13)).toBe('Undershirt');
  });

  it('returns null for out-of-range or non-integer indexes', () => {
    expect(textForCategoryIndex(-1)).toBeNull();
    expect(textForCategoryIndex(CATEGORY_MODEL_LABELS.length)).toBeNull();
    expect(textForCategoryIndex(1.5)).toBeNull();
  });
});
