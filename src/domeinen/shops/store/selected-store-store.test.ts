import { describe, expect, it } from 'vitest';
import { createInMemoryStore } from '@/test/fakes';
import { createSelectedStoreStore, SELECTED_STORE_KEY } from './selected-store-store';

describe('selected store store', () => {
  it('restores a remembered branch id', async () => {
    const keyValueStore = createInMemoryStore();
    await keyValueStore.setItem(SELECTED_STORE_KEY, 'store-a');
    const selected = createSelectedStoreStore(keyValueStore);

    await selected.restore();

    expect(selected.store.getState().storeId).toBe('store-a');
  });

  it('persists a choice and clears it on sign-out', async () => {
    const keyValueStore = createInMemoryStore();
    const selected = createSelectedStoreStore(keyValueStore);

    await selected.choose('store-b');
    expect(await keyValueStore.getItem(SELECTED_STORE_KEY)).toBe('store-b');

    await selected.clear();
    expect(selected.store.getState().storeId).toBeNull();
    expect(await keyValueStore.getItem(SELECTED_STORE_KEY)).toBeNull();
  });
});
