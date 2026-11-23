import { z } from 'zod';
import type { HttpClient } from '@/shared/api/http-client';
import type { MultipartUploadFile } from '@/shared/platform/ports';

/**
 * Tolerant copies of `@occa/contracts/shop/v1/item-create` for the Expo app.
 * Create the concept, then upload each photo; both are safe to send again.
 */

export const shopItemCreatedSchema = z.looseObject({
  itemId: z.string().min(1),
  created: z.boolean(),
});

export const shopPhotoStatusSchema = z.enum(['wachtend', 'bezig', 'klaar', 'mislukt']);

export const shopItemPhotoUploadedSchema = z.looseObject({
  itemId: z.string().min(1),
  role: z.enum(['main', 'label', 'extra']),
  stored: z.boolean(),
  photoStatus: shopPhotoStatusSchema.nullable(),
});

export type ShopItemCreated = z.infer<typeof shopItemCreatedSchema>;
export type ShopItemPhotoUploaded = z.infer<typeof shopItemPhotoUploadedSchema>;
export type ShopPhotoStatus = z.infer<typeof shopPhotoStatusSchema>;

export type CreateItemBody = {
  clientKey: string;
  fields?: Record<string, unknown>;
  suggestions?: Record<string, unknown>;
};

export type UploadPhotoInput = {
  role: 'main' | 'label' | 'extra';
  photoKey: string;
  photo: MultipartUploadFile;
};

export type ShopItemCreateApi = {
  create(storeId: string, body: CreateItemBody): Promise<ShopItemCreated>;
  uploadPhoto(
    storeId: string,
    itemId: string,
    input: UploadPhotoInput,
  ): Promise<ShopItemPhotoUploaded>;
};

export function createShopItemCreateApi(http: HttpClient): ShopItemCreateApi {
  return {
    create(storeId, body) {
      return http.requestJson(
        `/api/v1/shop/stores/${encodeURIComponent(storeId)}/items`,
        shopItemCreatedSchema,
        { method: 'POST', json: body },
      );
    },

    async uploadPhoto(storeId, itemId, input) {
      const form = new FormData();
      form.append('role', input.role);
      form.append('photoKey', input.photoKey);
      input.photo.appendTo(form, 'photo');
      try {
        return await http.requestJson(
          `/api/v1/shop/stores/${encodeURIComponent(storeId)}/items/${encodeURIComponent(itemId)}/photos`,
          shopItemPhotoUploadedSchema,
          { method: 'POST', body: form, timeoutMs: 120_000 },
        );
      } finally {
        await input.photo.remove();
      }
    },
  };
}
