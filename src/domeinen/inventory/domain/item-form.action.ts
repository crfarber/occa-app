import {
  formFromDetail,
  type ItemDetailFields,
  type ItemFormState,
  type ItemPatchErrorKey,
} from './item-form';

/** Ephemeral edit UI for one inventory item (form draft + save error). */
export type ItemFormUiState = {
  form: ItemFormState | null;
  errorKey: ItemPatchErrorKey | null;
};

export const ItemFormActionType = {
  Hydrated: 'hydrated',
  FieldChanged: 'fieldChanged',
  SaveStarted: 'saveStarted',
  SaveSucceeded: 'saveSucceeded',
  SaveFailed: 'saveFailed',
} as const;

export type ItemFormAction =
  | { type: typeof ItemFormActionType.Hydrated; detail: ItemDetailFields }
  | {
      type: typeof ItemFormActionType.FieldChanged;
      field: keyof ItemFormState;
      value: ItemFormState[keyof ItemFormState];
    }
  | { type: typeof ItemFormActionType.SaveStarted }
  | { type: typeof ItemFormActionType.SaveSucceeded; detail: ItemDetailFields }
  | { type: typeof ItemFormActionType.SaveFailed; key: ItemPatchErrorKey };

export function createInitialItemFormState(): ItemFormUiState {
  return { form: null, errorKey: null };
}

export function itemFormHydrated(detail: ItemDetailFields): ItemFormAction {
  return { type: ItemFormActionType.Hydrated, detail };
}

export function itemFormFieldChanged<K extends keyof ItemFormState>(
  field: K,
  value: ItemFormState[K],
): ItemFormAction {
  return { type: ItemFormActionType.FieldChanged, field, value };
}

export function itemFormSaveStarted(): ItemFormAction {
  return { type: ItemFormActionType.SaveStarted };
}

export function itemFormSaveSucceeded(detail: ItemDetailFields): ItemFormAction {
  return { type: ItemFormActionType.SaveSucceeded, detail };
}

export function itemFormSaveFailed(key: ItemPatchErrorKey): ItemFormAction {
  return { type: ItemFormActionType.SaveFailed, key };
}

export function itemFormReducer(state: ItemFormUiState, action: ItemFormAction): ItemFormUiState {
  switch (action.type) {
    case ItemFormActionType.Hydrated:
      return { form: formFromDetail(action.detail), errorKey: null };
    case ItemFormActionType.FieldChanged: {
      if (state.form === null) return state;
      return {
        form: { ...state.form, [action.field]: action.value },
        errorKey: null,
      };
    }
    case ItemFormActionType.SaveStarted:
      return { ...state, errorKey: null };
    case ItemFormActionType.SaveSucceeded:
      return { form: formFromDetail(action.detail), errorKey: null };
    case ItemFormActionType.SaveFailed:
      return { ...state, errorKey: action.key };
  }
}
