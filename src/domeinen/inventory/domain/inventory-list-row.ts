export type InventoryListItemFields = {
  brand: string | null;
  category: string | null;
  size: string | null;
  priceCents: number | null;
  location: string | null;
  /** Shop item number when present — helps tell similar cards apart. */
  number?: number | null;
};

export type InventoryListRowCopy = {
  title: string;
  subtitle: string | null;
};

function euros(cents: number | null): string | null {
  if (cents === null) return null;
  return `€ ${(cents / 100).toFixed(2).replace('.', ',')}`;
}

/** Title and subtitle for one Inboedel list card. */
export function inventoryListRow(
  item: InventoryListItemFields,
  untitledLabel: string,
  options: { includeCategory?: boolean } = {},
): InventoryListRowCopy {
  const includeCategory = options.includeCategory !== false;
  const titleParts = includeCategory ? [item.brand, item.category] : [item.brand];
  const title =
    titleParts.filter((part) => part !== null && part !== '').join(' · ') || untitledLabel;
  const numberLabel =
    item.number !== undefined && item.number !== null ? `#${String(item.number)}` : null;
  const subtitleParts = [numberLabel, item.size, euros(item.priceCents), item.location].filter(
    (part) => part !== null && part !== '',
  );
  return {
    title,
    subtitle: subtitleParts.length > 0 ? subtitleParts.join(' · ') : null,
  };
}
