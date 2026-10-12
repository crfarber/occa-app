import { describe, expect, it } from 'vitest';
import { applyListingPatch, emptyListing, listingSummary } from './listing';

describe('product listing', () => {
  it('starts every website field empty', () => {
    expect(emptyListing()).toEqual({
      brand: '',
      price: '',
      description: '',
      category: '',
      subcategory: '',
      color: '',
      audience: '',
      size: '',
      shopSpot: '',
      number: '',
    });
  });

  it('changes one field and keeps the others', () => {
    const filled = applyListingPatch(emptyListing(), {
      category: 'Bovenkleding',
      size: 'XL',
    });

    expect(filled.category).toBe('Bovenkleding');
    expect(filled.size).toBe('XL');
    expect(filled.color).toBe('');
    expect(filled.description).toBe('');
  });

  it('summarizes the filled product facts and skips blanks', () => {
    const listing = applyListingPatch(emptyListing(), {
      category: 'Bovenkleding',
      subcategory: '  ',
      color: 'beige',
      size: 'XL',
      number: '0015',
    });

    expect(listingSummary(listing)).toBe('Bovenkleding · beige · XL · 0015');
  });

  it('has no summary while the listing is still empty', () => {
    expect(listingSummary(emptyListing())).toBeNull();
  });
});
