/**
 * Picks which branch the inventory screen should use.
 * Keeps the current id when it is still in the list; otherwise the first
 * store (or null when the person has none). Covers a stale id left over
 * from another environment (local Docker vs cloud).
 */
export function resolveSelectedStoreId(
  current: string | null,
  stores: readonly { id: string }[],
): string | null {
  if (stores.length === 0) {
    return null;
  }
  if (current !== null && stores.some((store) => store.id === current)) {
    return current;
  }
  return stores[0]?.id ?? null;
}
