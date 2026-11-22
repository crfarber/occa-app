import { describe, expect, it } from 'vitest';
import { PRODUCT_CATEGORIES } from '@/domeinen/capture';

import { platformCategoryOf } from './category-map';
import { isPlatformCategory, PLATFORM_CATEGORIES } from './platform-categories';

describe('platformCategoryOf', () => {
  it('maps every phone category to a canonical platform slug', () => {
    for (const category of PRODUCT_CATEGORIES) {
      const platform = platformCategoryOf(category);
      expect(platform).not.toBeNull();
      if (platform === null) continue;
      expect(isPlatformCategory(platform)).toBe(true);
      expect(PLATFORM_CATEGORIES).toContain(platform);
    }
  });

  it('maps schoenen to sneaker, not the synonym sneakers', () => {
    expect(platformCategoryOf('schoenen')).toBe('sneaker');
  });

  it('maps trui_vest to trui', () => {
    expect(platformCategoryOf('trui_vest')).toBe('trui');
  });

  it('returns null for empty input', () => {
    expect(platformCategoryOf('')).toBeNull();
    expect(platformCategoryOf(null)).toBeNull();
    expect(platformCategoryOf(undefined)).toBeNull();
  });
});
