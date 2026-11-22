import type { ProductCategory } from '@/domeinen/capture';

import { type PlatformCategory } from './platform-categories';

/**
 * The phone's product categories → the platform's vocabulary
 * (`PLATFORM_CATEGORIES` / @occa/core CATEGORIES). Values must be canonical
 * `isCategory` slugs, never synonyms. Unknown leaves go as a proposal only,
 * so a guess never becomes a fact on the website.
 */
const TO_PLATFORM: Record<ProductCategory, PlatformCategory> = {
  top: 'top',
  broek: 'broek',
  schoenen: 'sneaker',
  tas: 'tas',
  jas: 'jas',
  rok: 'rok',
  jurk: 'jurk',
  trui_vest: 'trui',
};

/** The platform category for a phone category, or null when there is none. */
export function platformCategoryOf(
  category: ProductCategory | '' | null | undefined,
): PlatformCategory | null {
  if (category === null || category === undefined || category === '') return null;
  return TO_PLATFORM[category] ?? null;
}
