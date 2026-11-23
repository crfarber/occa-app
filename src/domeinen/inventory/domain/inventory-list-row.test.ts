import { describe, expect, it } from 'vitest';
import { inventoryListRow, type InventoryListItemFields } from './inventory-list-row';

const base: InventoryListItemFields = {
  category: 'jas',
  brand: 'Adidas',
  size: 'M',
  priceCents: 1250,
  location: 'A1',
};

describe('inventoryListRow', () => {
  it('joins brand and category as the title', () => {
    expect(inventoryListRow(base, 'Artikel').title).toBe('Adidas · jas');
  });

  it('can omit category when the section already shows it', () => {
    expect(inventoryListRow(base, 'Artikel', { includeCategory: false }).title).toBe('Adidas');
  });

  it('falls back to the untitled label', () => {
    expect(inventoryListRow({ ...base, brand: null, category: null }, 'Artikel').title).toBe(
      'Artikel',
    );
  });

  it('builds a subtitle from size, price and location', () => {
    expect(inventoryListRow(base, 'Artikel').subtitle).toBe('M · € 12,50 · A1');
  });

  it('puts the item number first in the subtitle so similar cards stay distinct', () => {
    expect(inventoryListRow({ ...base, number: 42 }, 'Artikel').subtitle).toBe(
      '#42 · M · € 12,50 · A1',
    );
  });

  it('returns a null subtitle when every meta field is empty', () => {
    expect(
      inventoryListRow({ ...base, size: null, priceCents: null, location: null }, 'Artikel')
        .subtitle,
    ).toBeNull();
  });
});
