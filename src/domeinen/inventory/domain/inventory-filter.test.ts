import { describe, expect, it } from 'vitest';
import {
  activeFilterCount,
  emptyInventoryFilter,
  toggleValue,
  toItemsQuery,
} from './inventory-filter';

describe('emptyInventoryFilter', () => {
  it('starts with no sizes, colour or categories', () => {
    expect(emptyInventoryFilter()).toEqual({ sizes: [], colour: null, categories: [] });
  });
});

describe('toggleValue', () => {
  it('adds a missing value without mutating the input', () => {
    const input = ['M'];
    expect(toggleValue(input, 'L')).toEqual(['M', 'L']);
    expect(input).toEqual(['M']);
  });

  it('removes a present value', () => {
    expect(toggleValue(['M', 'L'], 'M')).toEqual(['L']);
  });
});

describe('activeFilterCount', () => {
  it('counts sizes, categories and a selected colour', () => {
    expect(activeFilterCount({ sizes: ['M', 'L'], colour: 'zwart', categories: ['trui'] })).toBe(4);
  });

  it('ignores a null colour', () => {
    expect(activeFilterCount({ sizes: [], colour: null, categories: [] })).toBe(0);
  });
});

describe('toItemsQuery', () => {
  it('maps search and filters to the API query shape', () => {
    expect(toItemsQuery(' jas ', { sizes: ['M'], colour: 'zwart', categories: ['trui'] })).toEqual({
      search: 'jas',
      sizes: ['M'],
      colours: ['zwart'],
      categories: ['trui'],
    });
  });

  it('omits empty parts', () => {
    expect(toItemsQuery('  ', emptyInventoryFilter())).toEqual({});
  });
});
