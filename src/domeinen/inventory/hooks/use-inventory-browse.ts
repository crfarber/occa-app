import { useReducer } from 'react';
import { useDebouncedValue } from '@/shared/ui/use-debounced-value';
import {
  createInitialInventoryBrowseState,
  inventoryBrowseReducer,
  inventoryDraftApplied,
  inventoryDraftCategoryToggled,
  inventoryDraftCleared,
  inventoryDraftColourSelected,
  inventoryDraftSizeToggled,
  inventorySearchChanged,
  inventorySheetDismissed,
  inventorySheetOpened,
  type InventoryBrowseState,
} from '../domain/inventory-browse.action';
import { activeFilterCount } from '../domain/inventory-filter';

export const SEARCH_DEBOUNCE_MS = 300;

type UseInventoryBrowseResult = {
  state: InventoryBrowseState;
  debouncedSearch: string;
  activeCount: number;
  setSearch(text: string): void;
  openSheet(): void;
  dismissSheet(): void;
  toggleSize(value: string): void;
  selectColour(value: string | null): void;
  toggleCategory(value: string): void;
  clearDraft(): void;
  applyDraft(): void;
};

/**
 * Search text, applied filters and the filter sheet draft for Inboedel.
 * Server data stays in Query; this only owns ephemeral browse UI state.
 */
export function useInventoryBrowse(): UseInventoryBrowseResult {
  const [state, dispatch] = useReducer(
    inventoryBrowseReducer,
    undefined,
    createInitialInventoryBrowseState,
  );
  const debouncedSearch = useDebouncedValue(state.search, SEARCH_DEBOUNCE_MS);

  return {
    state,
    debouncedSearch,
    activeCount: activeFilterCount(state.applied),
    setSearch: (text) => {
      dispatch(inventorySearchChanged(text));
    },
    openSheet: () => {
      dispatch(inventorySheetOpened());
    },
    dismissSheet: () => {
      dispatch(inventorySheetDismissed());
    },
    toggleSize: (value) => {
      dispatch(inventoryDraftSizeToggled(value));
    },
    selectColour: (value) => {
      dispatch(inventoryDraftColourSelected(value));
    },
    toggleCategory: (value) => {
      dispatch(inventoryDraftCategoryToggled(value));
    },
    clearDraft: () => {
      dispatch(inventoryDraftCleared());
    },
    applyDraft: () => {
      dispatch(inventoryDraftApplied());
    },
  };
}
