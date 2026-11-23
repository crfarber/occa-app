export type InventorySectionItem = {
  id: string;
  category: string | null;
};

export type InventorySection<T extends InventorySectionItem> = {
  /** Stable section key (category value, or empty for uncategorised). */
  key: string;
  title: string;
  data: T[];
};

/**
 * Groups stock rows into sections by category. Categories keep first-seen order
 * (API is newest-first); uncategorised items go last.
 */
export function groupInventoryByCategory<T extends InventorySectionItem>(
  items: readonly T[],
  uncategorizedTitle: string,
): InventorySection<T>[] {
  const sections: InventorySection<T>[] = [];
  const indexByKey = new Map<string, number>();

  for (const item of items) {
    const trimmed = item.category?.trim() ?? '';
    const key = trimmed;
    const title = trimmed === '' ? uncategorizedTitle : trimmed;
    const existing = indexByKey.get(key);
    if (existing === undefined) {
      indexByKey.set(key, sections.length);
      sections.push({ key, title, data: [item] });
    } else {
      const section = sections[existing];
      if (section !== undefined) {
        section.data.push(item);
      }
    }
  }

  // Uncategorised last; leave other sections in first-seen order.
  const withCategory: InventorySection<T>[] = [];
  let uncategorized: InventorySection<T> | null = null;
  for (const section of sections) {
    if (section.key === '') {
      uncategorized = section;
    } else {
      withCategory.push(section);
    }
  }
  if (uncategorized !== null) {
    withCategory.push(uncategorized);
  }
  return withCategory;
}
