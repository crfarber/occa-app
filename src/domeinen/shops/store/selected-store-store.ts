import { createStore, type StoreApi } from 'zustand/vanilla';
import type { KeyValueStore } from '@/shared/platform/ports';

export const SELECTED_STORE_KEY = 'shops.selectedStoreId';

export type SelectedStoreState = {
  storeId: string | null;
};

export type SelectedStoreStore = {
  store: StoreApi<SelectedStoreState>;
  /** Reads the last chosen branch, if any. Call once after sign-in restore. */
  restore(): Promise<void>;
  choose(storeId: string): Promise<void>;
  /** Clears the choice (sign-out). */
  clear(): Promise<void>;
};

export function createSelectedStoreStore(keyValueStore: KeyValueStore): SelectedStoreStore {
  const store = createStore<SelectedStoreState>()(() => ({ storeId: null }));

  return {
    store,

    async restore() {
      const stored = await keyValueStore.getItem(SELECTED_STORE_KEY);
      store.setState({ storeId: stored !== null && stored.length > 0 ? stored : null });
    },

    async choose(storeId) {
      store.setState({ storeId });
      await keyValueStore.setItem(SELECTED_STORE_KEY, storeId);
    },

    async clear() {
      store.setState({ storeId: null });
      await keyValueStore.removeItem(SELECTED_STORE_KEY);
    },
  };
}
