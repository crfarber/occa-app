import type { ProductCategory } from './interpret-labels';
import { PRODUCT_CATEGORIES } from './interpret-labels';
import type { ScanSectionKey } from './group-scans';

/**
 * i18n keys for capture product categories (`resources.ts` → `capture.category.*`).
 * Derived from {@link PRODUCT_CATEGORIES}: add a bucket there, add the same key
 * under `capture.category` in nl/en — no per-screen maps.
 */
export type CategoryMessageKey = `capture.category.${ProductCategory}`;

/** i18n keys for home scan sections (categories + unknown). */
export type ScanSectionMessageKey = `capture.category.${ScanSectionKey}`;

/** Translation key for a known product category. */
export function categoryMessageKey(category: ProductCategory): CategoryMessageKey {
  return `capture.category.${category}`;
}

/** Translation key for a scan list section (known category or unknown). */
export function scanSectionMessageKey(section: ScanSectionKey): ScanSectionMessageKey {
  return `capture.category.${section}`;
}

/** Every category message key — for tests that the i18n tree stays in sync. */
export const CATEGORY_MESSAGE_KEYS: readonly CategoryMessageKey[] = PRODUCT_CATEGORIES.map(
  categoryMessageKey,
);
