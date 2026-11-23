import { describe, expect, it } from 'vitest';
import { dedupeInventoryById } from './inventory-window';

describe('dedupeInventoryById', () => {
  it('keeps the first row when the same id appears twice', () => {
    expect(
      dedupeInventoryById([
        { id: 'a', label: 'first' },
        { id: 'b', label: 'only' },
        { id: 'a', label: 'second' },
      ]),
    ).toEqual([
      { id: 'a', label: 'first' },
      { id: 'b', label: 'only' },
    ]);
  });
});
