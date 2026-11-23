import { z } from 'zod';
import type { HttpClient } from '@/shared/api/http-client';
import type { QueryValue } from '@/shared/api/url';
import { shopItemStatusSchema, type ShopItemStatus } from './shop-item-status';

export { shopItemStatusSchema, type ShopItemStatus };

/** Default page size for Inboedel list requests (matches partner default). */
export const SHOP_ITEMS_PAGE_SIZE = 40;

/** Concept worker progress on the main photo (optional for older servers). */
export const shopPhotoStatusSchema = z.enum(['wachtend', 'bezig', 'klaar', 'mislukt']);

/** Tolerant copy of `@occa/contracts/shop/v1/items` for the Expo app. */
export const shopItemSchema = z.looseObject({
  id: z.string().min(1),
  status: shopItemStatusSchema,
  number: z.number().int().nullable(),
  category: z.string().nullable(),
  brand: z.string().nullable(),
  colour: z.string().nullable(),
  size: z.string().nullable(),
  priceCents: z.number().int().nullable(),
  location: z.string().nullable(),
  photoUrl: z.string().url().nullable(),
  createdAt: z.string().min(1),
  photoStatus: shopPhotoStatusSchema.nullable().optional(),
});

export const shopItemsPageSchema = z.looseObject({
  limit: z.number().int().positive(),
  offset: z.number().int().nonnegative(),
  total: z.number().int().nonnegative(),
  hasMore: z.boolean(),
});

export const shopItemsResponseSchema = z.looseObject({
  items: z.array(z.unknown()).transform((rows) => {
    const items: ShopItem[] = [];
    for (const row of rows) {
      const parsed = shopItemSchema.safeParse(row);
      if (parsed.success) {
        items.push(parsed.data);
      }
    }
    return items;
  }),
  page: shopItemsPageSchema,
});

const shopFilterOptionSchema = z.looseObject({
  value: z.string().min(1),
  label: z.string().min(1),
  count: z.number().int().nonnegative(),
});

function parseFilterOptions(rows: unknown): ShopItemFilterOption[] {
  if (!Array.isArray(rows)) return [];
  const options: ShopItemFilterOption[] = [];
  for (const row of rows) {
    const parsed = shopFilterOptionSchema.safeParse(row);
    if (parsed.success) {
      options.push(parsed.data);
    }
  }
  return options;
}

/** Tolerant copy of `@occa/contracts/shop/v1/item-filters`. */
export const shopItemFiltersResponseSchema = z.looseObject({
  sizes: z
    .unknown()
    .optional()
    .transform((rows) => parseFilterOptions(rows ?? [])),
  colours: z
    .unknown()
    .optional()
    .transform((rows) => parseFilterOptions(rows ?? [])),
  categories: z
    .unknown()
    .optional()
    .transform((rows) => parseFilterOptions(rows ?? [])),
});

export type ShopItem = z.infer<typeof shopItemSchema>;
export type ShopPhotoStatus = z.infer<typeof shopPhotoStatusSchema>;
export type ShopItemsPage = z.infer<typeof shopItemsPageSchema>;
export type ShopItemsResponse = { items: ShopItem[]; page: ShopItemsPage };
export type ShopItemFilterOption = { value: string; label: string; count: number };
export type ShopItemFilters = {
  sizes: ShopItemFilterOption[];
  colours: ShopItemFilterOption[];
  categories: ShopItemFilterOption[];
};

export type ShopItemsQuery = {
  search?: string;
  sizes?: readonly string[];
  colours?: readonly string[];
  categories?: readonly string[];
  limit?: number;
  offset?: number;
};

export type ShopItemsApi = {
  list(storeId: string, query?: ShopItemsQuery): Promise<ShopItemsResponse>;
  filters(storeId: string, locale: string): Promise<ShopItemFilters>;
};

function listQuery(query: ShopItemsQuery | undefined): Record<string, QueryValue> | undefined {
  if (query === undefined) return undefined;
  const out: Record<string, QueryValue> = {};
  const search = query.search?.trim() ?? '';
  if (search !== '') out.search = search;
  if (query.sizes !== undefined && query.sizes.length > 0) out.size = query.sizes;
  if (query.colours !== undefined && query.colours.length > 0) out.colour = query.colours;
  if (query.categories !== undefined && query.categories.length > 0) {
    out.category = query.categories;
  }
  if (query.limit !== undefined) out.limit = query.limit;
  if (query.offset !== undefined) out.offset = query.offset;
  return Object.keys(out).length > 0 ? out : undefined;
}

export function createShopItemsApi(http: HttpClient): ShopItemsApi {
  return {
    list(storeId, query) {
      return http.requestJson(
        `/api/v1/shop/stores/${encodeURIComponent(storeId)}/items`,
        shopItemsResponseSchema,
        { query: listQuery(query) },
      );
    },

    filters(storeId, locale) {
      return http.requestJson(
        `/api/v1/shop/stores/${encodeURIComponent(storeId)}/items/filters`,
        shopItemFiltersResponseSchema,
        { query: { locale } },
      );
    },
  };
}
