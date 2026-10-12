import { createStore, type StoreApi } from 'zustand/vanilla';
import type { Clock } from '@/shared/platform/ports';
import type { InterpretLabelsResult } from '../domain/interpret-labels';
import { applyListingPatch, emptyListing, type ListingDraft } from '../domain/listing';
import type { ScanPhoto } from '../domain/scan-photos';

export type ScannedItem = {
  id: string;
  scannedAt: number;
  photos: ScanPhoto[];
  result: InterpretLabelsResult;
  /** Website fields. Empty until someone fills them in on this item. */
  listing: ListingDraft;
};

export type ScanState = {
  items: ScannedItem[];
};

export type ScanStore = {
  store: StoreApi<ScanState>;
  record(input: {
    photos: ScanPhoto[];
    result: InterpretLabelsResult;
    listing?: Partial<ListingDraft>;
  }): void;
  updateListing(id: string, patch: Partial<ListingDraft>): void;
  clear(): void;
};

/** Client-side list of scans for this session. Cleared with the rest of the user data. */
export function createScanStore(clock: Clock): ScanStore {
  const store = createStore<ScanState>()(() => ({ items: [] }));
  let sequence = 0;

  return {
    store,
    record(input) {
      sequence += 1;
      const scannedAt = clock.now();
      const item: ScannedItem = {
        id: `${scannedAt}-${sequence}`,
        scannedAt,
        photos: input.photos,
        result: input.result,
        listing: applyListingPatch(emptyListing(), input.listing ?? {}),
      };
      store.setState((state) => ({ items: [item, ...state.items] }));
    },
    updateListing(id, patch) {
      const items = store.getState().items;
      const index = items.findIndex((item) => item.id === id);
      const current = index === -1 ? undefined : items[index];
      if (current === undefined) {
        return;
      }
      const next = items.slice();
      next[index] = {
        ...current,
        listing: applyListingPatch(current.listing, patch),
      };
      store.setState({ items: next });
    },
    clear() {
      store.setState({ items: [] });
    },
  };
}
