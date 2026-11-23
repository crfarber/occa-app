/** Applied or draft filters for the Inboedel list. */
export type InventoryFilter = {
  sizes: string[];
  colour: string | null;
  categories: string[];
};

/** Query shape for the items list endpoint (search + filter values). */
export type InventoryItemsQuery = {
  search?: string;
  sizes?: readonly string[];
  colours?: readonly string[];
  categories?: readonly string[];
};

export function emptyInventoryFilter(): InventoryFilter {
  return { sizes: [], colour: null, categories: [] };
}

/** Returns a new array with `value` added or removed. Does not mutate `values`. */
export function toggleValue(values: readonly string[], value: string): string[] {
  if (values.includes(value)) {
    return values.filter((entry) => entry !== value);
  }
  return [...values, value];
}

export function activeFilterCount(filter: InventoryFilter): number {
  return filter.sizes.length + filter.categories.length + (filter.colour !== null ? 1 : 0);
}

export function toItemsQuery(search: string, filter: InventoryFilter): InventoryItemsQuery {
  const query: InventoryItemsQuery = {};
  const trimmed = search.trim();
  if (trimmed !== '') query.search = trimmed;
  if (filter.sizes.length > 0) query.sizes = filter.sizes;
  if (filter.colour !== null) query.colours = [filter.colour];
  if (filter.categories.length > 0) query.categories = filter.categories;
  return query;
}
