import { useEffect, useReducer } from 'react';
import type { ShopItemDetail } from '../api/shop-item-detail';
import {
  buildItemPatch,
  type ItemFormState,
  type ItemPatchErrorKey,
  type ItemPatchFields,
} from '../domain/item-form';
import {
  createInitialItemFormState,
  itemFormFieldChanged,
  itemFormHydrated,
  itemFormReducer,
  itemFormSaveFailed,
  itemFormSaveStarted,
  itemFormSaveSucceeded,
  type ItemFormUiState,
} from '../domain/item-form.action';

type UseItemFormResult = {
  state: ItemFormUiState;
  setField: <K extends keyof ItemFormState>(field: K, value: ItemFormState[K]) => void;
  /** Clears the error and returns the patch, or null when the form is not ready. */
  beginSave: (detail: ShopItemDetail) => ItemPatchFields | null;
  markSaved: (detail: ShopItemDetail) => void;
  markSaveFailed: (key: ItemPatchErrorKey) => void;
};

/**
 * Local edit draft for one inventory item: hydrate from Query, field updates,
 * save success/failure — all via a pure reducer in `item-form.action.ts`.
 */
export function useItemForm(detail: ShopItemDetail | undefined): UseItemFormResult {
  const [state, dispatch] = useReducer(itemFormReducer, undefined, createInitialItemFormState);

  useEffect(() => {
    if (detail !== undefined) {
      dispatch(itemFormHydrated(detail));
    }
  }, [detail]);

  return {
    state,
    setField: (field, value) => {
      dispatch(itemFormFieldChanged(field, value));
    },
    beginSave: (loaded) => {
      if (state.form === null) return null;
      dispatch(itemFormSaveStarted());
      return buildItemPatch(loaded, state.form);
    },
    markSaved: (saved) => {
      dispatch(itemFormSaveSucceeded(saved));
    },
    markSaveFailed: (key) => {
      dispatch(itemFormSaveFailed(key));
    },
  };
}
