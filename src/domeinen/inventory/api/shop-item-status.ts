import { z } from 'zod';

/** Shared item status union — own module so detail/list schemas never see a partial import. */
export const shopItemStatusSchema = z.enum([
  'concept',
  'gepubliceerd',
  'aangevraagd',
  'bevestigd',
  'terughangen',
  'verkocht',
  'verwijderd',
]);

export type ShopItemStatus = z.infer<typeof shopItemStatusSchema>;
