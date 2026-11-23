import { emptyInventoryFilter, toggleValue, type InventoryFilter } from './inventory-filter';

export type InventoryBrowseSheet =
  { phase: 'closed' } | { phase: 'editing'; draft: InventoryFilter };

export type InventoryBrowseState = {
  search: string;
  applied: InventoryFilter;
  sheet: InventoryBrowseSheet;
};

export const InventoryBrowseActionType = {
  SearchChanged: 'searchChanged',
  SheetOpened: 'sheetOpened',
  DraftSizeToggled: 'draftSizeToggled',
  DraftColourSelected: 'draftColourSelected',
  DraftCategoryToggled: 'draftCategoryToggled',
  DraftCleared: 'draftCleared',
  DraftApplied: 'draftApplied',
  SheetDismissed: 'sheetDismissed',
} as const;

export type InventoryBrowseAction =
  | { type: typeof InventoryBrowseActionType.SearchChanged; text: string }
  | { type: typeof InventoryBrowseActionType.SheetOpened }
  | { type: typeof InventoryBrowseActionType.DraftSizeToggled; value: string }
  | { type: typeof InventoryBrowseActionType.DraftColourSelected; value: string | null }
  | { type: typeof InventoryBrowseActionType.DraftCategoryToggled; value: string }
  | { type: typeof InventoryBrowseActionType.DraftCleared }
  | { type: typeof InventoryBrowseActionType.DraftApplied }
  | { type: typeof InventoryBrowseActionType.SheetDismissed };

export function createInitialInventoryBrowseState(): InventoryBrowseState {
  return {
    search: '',
    applied: emptyInventoryFilter(),
    sheet: { phase: 'closed' },
  };
}

export function inventorySearchChanged(text: string): InventoryBrowseAction {
  return { type: InventoryBrowseActionType.SearchChanged, text };
}

export function inventorySheetOpened(): InventoryBrowseAction {
  return { type: InventoryBrowseActionType.SheetOpened };
}

export function inventoryDraftSizeToggled(value: string): InventoryBrowseAction {
  return { type: InventoryBrowseActionType.DraftSizeToggled, value };
}

export function inventoryDraftColourSelected(value: string | null): InventoryBrowseAction {
  return { type: InventoryBrowseActionType.DraftColourSelected, value };
}

export function inventoryDraftCategoryToggled(value: string): InventoryBrowseAction {
  return { type: InventoryBrowseActionType.DraftCategoryToggled, value };
}

export function inventoryDraftCleared(): InventoryBrowseAction {
  return { type: InventoryBrowseActionType.DraftCleared };
}

export function inventoryDraftApplied(): InventoryBrowseAction {
  return { type: InventoryBrowseActionType.DraftApplied };
}

export function inventorySheetDismissed(): InventoryBrowseAction {
  return { type: InventoryBrowseActionType.SheetDismissed };
}

function copyFilter(filter: InventoryFilter): InventoryFilter {
  return {
    sizes: [...filter.sizes],
    colour: filter.colour,
    categories: [...filter.categories],
  };
}

function withDraft(
  state: InventoryBrowseState,
  update: (draft: InventoryFilter) => InventoryFilter,
): InventoryBrowseState {
  if (state.sheet.phase !== 'editing') return state;
  return {
    ...state,
    sheet: { phase: 'editing', draft: update(state.sheet.draft) },
  };
}

export function inventoryBrowseReducer(
  state: InventoryBrowseState,
  action: InventoryBrowseAction,
): InventoryBrowseState {
  switch (action.type) {
    case InventoryBrowseActionType.SearchChanged:
      return { ...state, search: action.text };
    case InventoryBrowseActionType.SheetOpened:
      return {
        ...state,
        sheet: { phase: 'editing', draft: copyFilter(state.applied) },
      };
    case InventoryBrowseActionType.DraftSizeToggled:
      return withDraft(state, (draft) => ({
        ...draft,
        sizes: toggleValue(draft.sizes, action.value),
      }));
    case InventoryBrowseActionType.DraftColourSelected:
      return withDraft(state, (draft) => ({ ...draft, colour: action.value }));
    case InventoryBrowseActionType.DraftCategoryToggled:
      return withDraft(state, (draft) => ({
        ...draft,
        categories: toggleValue(draft.categories, action.value),
      }));
    case InventoryBrowseActionType.DraftCleared:
      return withDraft(state, () => emptyInventoryFilter());
    case InventoryBrowseActionType.DraftApplied: {
      if (state.sheet.phase !== 'editing') return state;
      return {
        ...state,
        applied: copyFilter(state.sheet.draft),
        sheet: { phase: 'closed' },
      };
    }
    case InventoryBrowseActionType.SheetDismissed:
      return { ...state, sheet: { phase: 'closed' } };
  }
}
