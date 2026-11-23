import { describe, expect, it, vi } from 'vitest';
import type { HttpClient } from '@/shared/api/http-client';
import {
  createShopItemsApi,
  shopItemFiltersResponseSchema,
  shopItemsResponseSchema,
} from './shop-items';

const validRow = {
  id: 'item-1',
  status: 'concept',
  number: 3,
  category: 'jas',
  brand: null,
  colour: 'rood',
  size: 'M',
  priceCents: 1200,
  location: 'A1',
  photoUrl: null,
  createdAt: '2026-11-20T10:00:00.000Z',
};

const page = { limit: 40, offset: 0, total: 2, hasMore: false };

describe('shopItemsResponseSchema', () => {
  it('keeps valid rows, skips a broken row, and keeps page meta', () => {
    const parsed = shopItemsResponseSchema.parse({
      items: [validRow, { id: 'broken' }, { ...validRow, id: 'item-2', status: 'gepubliceerd' }],
      page,
    });
    expect(parsed.items.map((item) => item.id)).toEqual(['item-1', 'item-2']);
    expect(parsed.page).toEqual(page);
  });

  it('rejects a response without page meta', () => {
    expect(() => shopItemsResponseSchema.parse({ items: [validRow] })).toThrow();
  });
});

describe('shopItemFiltersResponseSchema', () => {
  it('keeps valid options and skips a broken one', () => {
    const parsed = shopItemFiltersResponseSchema.parse({
      sizes: [
        { value: 'M', label: 'M', count: 2 },
        { value: '', label: 'bad', count: 1 },
        { value: 'L', label: 'L', count: -1 },
      ],
      colours: [{ value: 'zwart', label: 'zwart', count: 1 }],
      categories: [{ value: 'trui', label: 'trui', count: 3 }],
    });
    expect(parsed.sizes.map((option) => option.value)).toEqual(['M']);
    expect(parsed.colours).toHaveLength(1);
    expect(parsed.categories[0]?.count).toBe(3);
  });

  it('treats a missing colours list as empty', () => {
    const parsed = shopItemFiltersResponseSchema.parse({
      sizes: [{ value: 'M', label: 'M', count: 1 }],
      categories: [],
    });
    expect(parsed.colours).toEqual([]);
    expect(parsed.sizes).toHaveLength(1);
  });
});

describe('createShopItemsApi', () => {
  it('sends search, filters, limit and offset on list', async () => {
    const requestJson = vi.fn().mockResolvedValue({ items: [], page });
    const api = createShopItemsApi({ requestJson } as unknown as HttpClient);

    await api.list('store-b', {
      search: ' jas ',
      sizes: ['M', 'L'],
      colours: ['zwart'],
      categories: ['trui'],
      limit: 40,
      offset: 40,
    });

    expect(requestJson).toHaveBeenCalledWith(
      '/api/v1/shop/stores/store-b/items',
      shopItemsResponseSchema,
      {
        query: {
          search: 'jas',
          size: ['M', 'L'],
          colour: ['zwart'],
          category: ['trui'],
          limit: 40,
          offset: 40,
        },
      },
    );
  });

  it('requests facets with a locale', async () => {
    const requestJson = vi.fn().mockResolvedValue({ sizes: [], colours: [], categories: [] });
    const api = createShopItemsApi({ requestJson } as unknown as HttpClient);

    await api.filters('store-b', 'en');

    expect(requestJson).toHaveBeenCalledWith(
      '/api/v1/shop/stores/store-b/items/filters',
      shopItemFiltersResponseSchema,
      { query: { locale: 'en' } },
    );
  });
});
