import { describe, expect, it } from 'vitest';
import type { InterpretLabelsResult, ProductCategory } from './interpret-labels';
import { groupScansByCategory, type GroupableScan } from './group-scans';

function emptyDraft(overrides: Partial<InterpretLabelsResult> = {}): InterpretLabelsResult {
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

function scan(id: string, category: ProductCategory | 'unknown'): GroupableScan {
  return {
    id,
    result:
      category === 'unknown'
        ? emptyDraft()
        : emptyDraft({
            category: { kind: 'known', category, score: 0.8 },
            uncertainFields: ['colors', 'pattern', 'subtype'],
          }),
  };
}

describe('groupScansByCategory', () => {
  it('returns no sections when nothing was scanned', () => {
    expect(groupScansByCategory([])).toEqual([]);
  });

  it('groups items under the category that was found, in a fixed order', () => {
    const sections = groupScansByCategory([
      scan('tas-1', 'tas'),
      scan('top-1', 'top'),
      scan('unknown-1', 'unknown'),
      scan('broek-1', 'broek'),
      scan('top-2', 'top'),
    ]);

    expect(sections.map((section) => section.key)).toEqual(['top', 'broek', 'tas', 'unknown']);
    expect(sections[0]?.data.map((item) => item.id)).toEqual(['top-1', 'top-2']);
  });

  it('keeps the given order inside a section', () => {
    const sections = groupScansByCategory([scan('newer', 'schoenen'), scan('older', 'schoenen')]);

    expect(sections).toEqual([
      {
        key: 'schoenen',
        data: [scan('newer', 'schoenen'), scan('older', 'schoenen')],
      },
    ]);
  });

  it('leaves out categories that have no items', () => {
    const sections = groupScansByCategory([scan('only', 'broek')]);

    expect(sections).toEqual([{ key: 'broek', data: [scan('only', 'broek')] }]);
  });
});
