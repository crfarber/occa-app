import { describe, expect, it } from 'vitest';
import { shopStoresResponseSchema } from './shop-stores';

describe('shopStoresResponseSchema', () => {
  it('keeps unknown fields on a store row', () => {
    const parsed = shopStoresResponseSchema.parse({
      stores: [{ id: 's1', name: 'De Proef', role: 'beheerder' }],
    });
    expect(parsed.stores[0]).toMatchObject({ id: 's1', name: 'De Proef', role: 'beheerder' });
  });

  it('rejects a store without an id', () => {
    expect(() => shopStoresResponseSchema.parse({ stores: [{ name: 'X' }] })).toThrow();
  });
});
