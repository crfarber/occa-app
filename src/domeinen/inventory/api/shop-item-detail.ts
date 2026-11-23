import { z } from 'zod';
import { HttpError } from '@/shared/api/errors';
import type { HttpClient } from '@/shared/api/http-client';
import { describeItemPatchFailure, type ItemPatchErrorKey } from '../domain/item-form';
import { shopItemStatusSchema } from './shop-item-status';

const shopItemSourceSchema = z.enum(['handmatig', 'aanbod', 'import']);

const shopPhotoStatusSchema = z.enum(['wachtend', 'bezig', 'klaar', 'mislukt']);

const shopItemPhotosSchema = z.looseObject({
  main: z.string().url().nullable(),
  extra: z.array(z.string().url()),
  label: z.string().url().nullable(),
  /** Camera / pre-background; optional for older servers. */
  original: z.string().url().nullable().optional(),
  /** Transparent cut-out PNG; optional. */
  cutout: z.string().url().nullable().optional(),
  background: z.enum(['creme', 'antraciet']).nullable().optional(),
});

/** Tolerant copy of `@occa/contracts/shop/v1/item-detail`. */
export const shopItemDetailSchema = z.looseObject({
  id: z.string().min(1),
  status: shopItemStatusSchema,
  number: z.number().int().nullable(),
  source: shopItemSourceSchema,
  category: z.string().nullable(),
  doelgroep: z.string().nullable(),
  size: z.string().nullable(),
  colour: z.string().nullable(),
  brand: z.string().nullable(),
  description: z.string().nullable(),
  priceCents: z.number().int().nullable(),
  location: z.string().nullable(),
  sport: z.boolean(),
  typeKeywords: z.array(z.string()),
  photos: shopItemPhotosSchema,
  createdAt: z.string().min(1),
  editable: z.boolean(),
  priceLocked: z.boolean(),
  photoStatus: shopPhotoStatusSchema.nullable().optional(),
});

export const shopItemPatchSchema = z.looseObject({
  category: z.string().nullable().optional(),
  doelgroep: z.string().nullable().optional(),
  size: z.string().nullable().optional(),
  colour: z.string().nullable().optional(),
  brand: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  priceCents: z.number().int().nullable().optional(),
  location: z.string().nullable().optional(),
  sport: z.boolean().optional(),
  typeKeywords: z.array(z.string()).optional(),
});

const shopOptionSchema = z.looseObject({
  value: z.string().min(1),
  label: z.string().min(1),
});

export const shopItemOptionsSchema = z.looseObject({
  categories: z.array(
    z.looseObject({
      value: z.string().min(1),
      label: z.string().min(1),
      group: z.string().min(1),
      groupLabel: z.string().min(1),
    }),
  ),
  colours: z.array(shopOptionSchema),
  doelgroepen: z.array(shopOptionSchema),
  sizes: z.array(
    z.looseObject({
      scale: z.string().min(1),
      title: z.string().min(1),
      values: z.array(z.string()),
    }),
  ),
});

export type ShopItemDetail = z.infer<typeof shopItemDetailSchema>;
export type ShopItemPatch = z.infer<typeof shopItemPatchSchema>;
export type ShopItemOptions = z.infer<typeof shopItemOptionsSchema>;

export class ItemPatchError extends Error {
  readonly key: ItemPatchErrorKey;
  readonly code: string | null;

  constructor(key: ItemPatchErrorKey, code: string | null) {
    super(key);
    this.name = 'ItemPatchError';
    this.key = key;
    this.code = code;
  }
}

function patchErrorFromHttp(error: HttpError): ItemPatchError {
  let code: string | undefined;
  try {
    const parsed: unknown = JSON.parse(error.body);
    if (typeof parsed === 'object' && parsed !== null && 'code' in parsed) {
      const value = (parsed as { code: unknown }).code;
      if (typeof value === 'string') code = value;
    }
  } catch {
    // not JSON
  }
  return new ItemPatchError(describeItemPatchFailure({ code }), code ?? null);
}

export type ShopItemDetailApi = {
  get(storeId: string, itemId: string): Promise<ShopItemDetail>;
  update(storeId: string, itemId: string, patch: ShopItemPatch): Promise<ShopItemDetail>;
  options(filters?: {
    category?: string | null;
    doelgroep?: string | null;
  }): Promise<ShopItemOptions>;
};

export function createShopItemDetailApi(http: HttpClient): ShopItemDetailApi {
  return {
    get(storeId, itemId) {
      return http.requestJson(
        `/api/v1/shop/stores/${encodeURIComponent(storeId)}/items/${encodeURIComponent(itemId)}`,
        shopItemDetailSchema,
      );
    },

    async update(storeId, itemId, patch) {
      try {
        return await http.requestJson(
          `/api/v1/shop/stores/${encodeURIComponent(storeId)}/items/${encodeURIComponent(itemId)}`,
          shopItemDetailSchema,
          { method: 'PATCH', json: patch },
        );
      } catch (error) {
        if (error instanceof HttpError) {
          throw patchErrorFromHttp(error);
        }
        throw error;
      }
    },

    options(filters = {}) {
      const query: Record<string, string | undefined> = {};
      if (filters.category !== undefined && filters.category !== null && filters.category !== '') {
        query.category = filters.category;
      }
      if (
        filters.doelgroep !== undefined &&
        filters.doelgroep !== null &&
        filters.doelgroep !== ''
      ) {
        query.doelgroep = filters.doelgroep;
      }
      return http.requestJson('/api/v1/shop/item-options', shopItemOptionsSchema, {
        query: Object.keys(query).length > 0 ? query : undefined,
      });
    },
  };
}
