import { PRODUCT_CATEGORIES, type InterpretLabelsResult } from './interpret-labels';

/** A scan the list can group. The store adds id and time; grouping only needs the result. */
export type GroupableScan = {
  id: string;
  result: InterpretLabelsResult;
};

export const SCAN_SECTION_ORDER = [...PRODUCT_CATEGORIES, 'unknown'] as const;
export type ScanSectionKey = (typeof SCAN_SECTION_ORDER)[number];

export type ScanSection<Item extends GroupableScan> = {
  key: ScanSectionKey;
  data: Item[];
};

function sectionKey(result: InterpretLabelsResult): ScanSectionKey {
  return result.category.kind === 'known' ? result.category.category : 'unknown';
}

/**
 * Groups scans by what was recognised. Empty categories are omitted.
 * Order inside a section stays the order of `items` (newest first, when the store prepends).
 */
export function groupScansByCategory<Item extends GroupableScan>(
  items: readonly Item[],
): ScanSection<Item>[] {
  const grouped = new Map<ScanSectionKey, Item[]>();

  for (const item of items) {
    const key = sectionKey(item.result);
    const bucket = grouped.get(key);
    if (bucket === undefined) {
      grouped.set(key, [item]);
    } else {
      bucket.push(item);
    }
  }

  const sections: ScanSection<Item>[] = [];
  for (const key of SCAN_SECTION_ORDER) {
    const data = grouped.get(key);
    if (data !== undefined && data.length > 0) {
      sections.push({ key, data });
    }
  }
  return sections;
}
