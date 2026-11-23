import { z } from 'zod';
import type { HttpClient } from '@/shared/api/http-client';

/** Tolerant copy of `@occa/contracts/shop/v1/stores` for the Expo app. */
export const shopStoreSchema = z.looseObject({
  id: z.string().min(1),
  name: z.string().min(1),
});

export const shopStoresResponseSchema = z.looseObject({
  stores: z.array(shopStoreSchema),
});

export type ShopStore = z.infer<typeof shopStoreSchema>;
export type ShopStoresResponse = z.infer<typeof shopStoresResponseSchema>;

export type ShopStoresApi = {
  list(): Promise<ShopStoresResponse>;
};

export function createShopStoresApi(http: HttpClient): ShopStoresApi {
  return {
    list: () => http.requestJson('/api/v1/shop/stores', shopStoresResponseSchema),
  };
}
