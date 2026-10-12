import { describe, expect, it } from 'vitest';
import {
  applyPixelColor,
  formDraftFromLabels,
  listingFromForm,
  listingFromLabels,
} from './draft-from-labels';
import type { InterpretLabelsResult } from './interpret-labels';

function result(overrides: Partial<InterpretLabelsResult> = {}): InterpretLabelsResult {
  return {
    category: { kind: 'unknown' },
    colors: [],
    pattern: { kind: 'unknown' },
    subtype: null,
    labels: [],
    uncertainFields: ['category', 'colors', 'pattern', 'subtype'],
    ...overrides,
  };
}

describe('formDraftFromLabels', () => {
  it('fills category and colour from a shirt with red', () => {
    const draft = formDraftFromLabels(
      result({
        category: { kind: 'known', category: 'top', score: 0.8 },
        colors: ['rood', 'wit'],
        subtype: null,
        uncertainFields: ['pattern', 'subtype'],
      }),
    );

    expect(draft).toEqual({
      category: 'top',
      color: 'rood',
      subcategory: '',
      pattern: '',
    });
  });

  it('leaves colour empty when only Clothing was found', () => {
    const draft = formDraftFromLabels(result());
    expect(draft.category).toBe('');
    expect(draft.color).toBe('');
    expect(draft.subcategory).toBe('');
    expect(draft.pattern).toBe('');
  });

  it('fills subtype and pattern when present', () => {
    const draft = formDraftFromLabels(
      result({
        category: { kind: 'known', category: 'broek', score: 0.9 },
        subtype: 'jeans',
        pattern: { kind: 'known', pattern: 'gestreept', score: 0.6 },
        uncertainFields: ['colors'],
      }),
    );

    expect(draft.category).toBe('broek');
    expect(draft.subcategory).toBe('jeans');
    expect(draft.pattern).toBe('gestreept');
  });
});

describe('applyPixelColor', () => {
  it('fills colour when ML left it empty', () => {
    const draft = formDraftFromLabels(result());
    expect(applyPixelColor(draft, 'wit').color).toBe('wit');
  });

  it('does not override an ML colour', () => {
    const draft = formDraftFromLabels(
      result({
        colors: ['rood'],
        uncertainFields: ['category', 'pattern', 'subtype'],
      }),
    );
    expect(applyPixelColor(draft, 'wit').color).toBe('rood');
  });

  it('ignores a null pixel sample', () => {
    const draft = formDraftFromLabels(result());
    expect(applyPixelColor(draft, null).color).toBe('');
  });
});

describe('listingFromLabels', () => {
  it('maps recognised fields onto the listing patch', () => {
    expect(
      listingFromLabels(
        result({
          category: { kind: 'known', category: 'top', score: 0.8 },
          colors: ['wit'],
          subtype: 'blouse',
          uncertainFields: ['pattern'],
        }),
      ),
    ).toEqual({
      category: 'top',
      color: 'wit',
      subcategory: 'blouse',
    });
  });

  it('keeps pattern out of the listing', () => {
    const listing = listingFromForm({
      category: 'top',
      color: 'zwart',
      subcategory: '',
      pattern: 'gestreept',
    });
    expect(listing).toEqual({
      category: 'top',
      color: 'zwart',
      subcategory: '',
    });
    expect(listing).not.toHaveProperty('pattern');
  });
});
