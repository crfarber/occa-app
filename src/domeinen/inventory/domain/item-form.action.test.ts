import { describe, expect, it } from 'vitest';
import type { ItemDetailFields } from './item-form';
import {
  createInitialItemFormState,
  itemFormFieldChanged,
  itemFormHydrated,
  itemFormReducer,
  itemFormSaveFailed,
  itemFormSaveStarted,
  itemFormSaveSucceeded,
} from './item-form.action';

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

describe('itemFormReducer', () => {
  it('starts empty', () => {
    expect(createInitialItemFormState()).toEqual({ form: null, errorKey: null });
  });

  it('hydrates the form from detail and clears errors', () => {
    const withError = {
      form: null,
      errorKey: 'inventoryItem.errors.saveFailed' as const,
    };
    const next = itemFormReducer(withError, itemFormHydrated(detail));
    expect(next.errorKey).toBeNull();
    expect(next.form?.brand).toBe('Remi');
    expect(next.form?.priceText).toBe('12,50');
  });

  it('updates one field and clears the error', () => {
    const hydrated = itemFormReducer(createInitialItemFormState(), itemFormHydrated(detail));
    const withError = itemFormReducer(
      hydrated,
      itemFormSaveFailed('inventoryItem.errors.priceLocked'),
    );
    const next = itemFormReducer(withError, itemFormFieldChanged('brand', 'Nieuw'));
    expect(next.form?.brand).toBe('Nieuw');
    expect(next.errorKey).toBeNull();
  });

  it('ignores field changes before hydrate', () => {
    const initial = createInitialItemFormState();
    expect(itemFormReducer(initial, itemFormFieldChanged('brand', 'X'))).toBe(initial);
  });

  it('clears the error when save starts', () => {
    const hydrated = itemFormReducer(createInitialItemFormState(), itemFormHydrated(detail));
    const withError = itemFormReducer(
      hydrated,
      itemFormSaveFailed('inventoryItem.errors.missingFields'),
    );
    expect(itemFormReducer(withError, itemFormSaveStarted()).errorKey).toBeNull();
  });

  it('replaces the form after a successful save', () => {
    const hydrated = itemFormReducer(createInitialItemFormState(), itemFormHydrated(detail));
    const edited = itemFormReducer(hydrated, itemFormFieldChanged('brand', 'Tijdelijk'));
    const next = itemFormReducer(edited, itemFormSaveSucceeded({ ...detail, brand: 'Opgeslagen' }));
    expect(next.form?.brand).toBe('Opgeslagen');
    expect(next.errorKey).toBeNull();
  });

  it('stores the save failure key', () => {
    const hydrated = itemFormReducer(createInitialItemFormState(), itemFormHydrated(detail));
    const next = itemFormReducer(
      hydrated,
      itemFormSaveFailed('inventoryItem.errors.changedMeanwhile'),
    );
    expect(next.errorKey).toBe('inventoryItem.errors.changedMeanwhile');
    expect(next.form?.brand).toBe('Remi');
  });
});
