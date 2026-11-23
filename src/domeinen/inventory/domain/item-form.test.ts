import { describe, expect, it } from 'vitest';
import {
  buildItemPatch,
  centsToPriceText,
  describeItemPatchFailure,
  formFromDetail,
  priceTextToCents,
  type ItemDetailFields,
  type ItemFormState,
} from './item-form';

const detail: ItemDetailFields = {
  category: 'jas',
  doelgroep: 'dames',
  size: 'M',
  colour: 'rood',
  brand: 'Remi',
  description: 'Warm',
  priceCents: 1250,
  location: 'A1',
  sport: false,
  typeKeywords: ['parka'],
};

describe('priceTextToCents / centsToPriceText', () => {
  it('parses a Dutch decimal comma', () => {
    expect(priceTextToCents('12,50')).toBe(1250);
    expect(priceTextToCents('7')).toBe(700);
  });

  it('formats cents with a comma', () => {
    expect(centsToPriceText(1250)).toBe('12,50');
    expect(centsToPriceText(null)).toBe('');
  });

  it('returns null for blank or invalid text', () => {
    expect(priceTextToCents('')).toBeNull();
    expect(priceTextToCents('abc')).toBeNull();
  });
});

describe('formFromDetail / buildItemPatch', () => {
  it('builds a form from the detail', () => {
    const form = formFromDetail(detail);
    expect(form.brand).toBe('Remi');
    expect(form.priceText).toBe('12,50');
    expect(form.typeKeywordsText).toBe('parka');
  });

  it('sends only changed fields in the patch', () => {
    const form: ItemFormState = { ...formFromDetail(detail), brand: 'Nieuw' };
    expect(buildItemPatch(detail, form)).toEqual({ brand: 'Nieuw' });
  });

  it('includes priceCents when the price text changed', () => {
    const form: ItemFormState = { ...formFromDetail(detail), priceText: '20' };
    expect(buildItemPatch(detail, form)).toEqual({ priceCents: 2000 });
  });
});

describe('describeItemPatchFailure', () => {
  it('maps a known code to an i18n key', () => {
    expect(describeItemPatchFailure({ code: 'price_locked' })).toBe(
      'inventoryItem.errors.priceLocked',
    );
  });

  it('falls back for an unknown body', () => {
    expect(describeItemPatchFailure({})).toBe('inventoryItem.errors.saveFailed');
  });
});
