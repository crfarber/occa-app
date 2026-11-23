/**
 * Keeps the first occurrence of each id. Guards against a duplicate row
 * looking like two cards (same article twice across pages or in one response).
 */
export function dedupeInventoryById<T extends { id: string }>(items: readonly T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const item of items) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    out.push(item);
  }
  return out;
}
