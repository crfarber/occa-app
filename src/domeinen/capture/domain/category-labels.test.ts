import { describe, expect, it } from 'vitest';
import { en, nl } from '@/shared/i18n/resources';

import {
  CATEGORY_MESSAGE_KEYS,
  categoryMessageKey,
  scanSectionMessageKey,
} from './category-labels';
import { PRODUCT_CATEGORIES } from './interpret-labels';
import { SCAN_SECTION_ORDER } from './group-scans';

describe('categoryMessageKey', () => {
  it('names every product category under capture.category', () => {
    expect(CATEGORY_MESSAGE_KEYS).toEqual(
      PRODUCT_CATEGORIES.map((category) => `capture.category.${category}`),
    );
  });

  it('has a Dutch and English label for every product category', () => {
    for (const category of PRODUCT_CATEGORIES) {
      expect(nl.capture.category[category].length).toBeGreaterThan(0);
      expect(en.capture.category[category].length).toBeGreaterThan(0);
      expect(categoryMessageKey(category)).toBe(`capture.category.${category}`);
    }
  });
});

describe('scanSectionMessageKey', () => {
  it('covers every scan section including unknown', () => {
    for (const section of SCAN_SECTION_ORDER) {
      expect(scanSectionMessageKey(section)).toBe(`capture.category.${section}`);
      expect(nl.capture.category[section].length).toBeGreaterThan(0);
      expect(en.capture.category[section].length).toBeGreaterThan(0);
    }
  });
});
