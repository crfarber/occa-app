import { createStore, type StoreApi } from 'zustand/vanilla';
import type { Clock } from '@/shared/platform/ports';
import {
  addCapturePhoto,
  emptyCaptureDraft,
  setCaptureLabel,
  type CaptureDraft,
} from '../domain/capture-draft';
import type { InterpretLabelsResult } from '../domain/interpret-labels';
import { applyListingPatch, emptyListing, type ListingDraft } from '../domain/listing';
import type { ScanPhoto } from '../domain/scan-photos';

export type ScannedItem = {
  id: string;
  scannedAt: number;
  photos: ScanPhoto[];
  labelText: string | null;
  result: InterpretLabelsResult;
  /** Website fields. Empty until someone fills them in on this item. */
  listing: ListingDraft;
};

export type ScanState = {
  items: ScannedItem[];
  draft: CaptureDraft;
};

export type ScanStore = {
  store: StoreApi<ScanState>;
  record(input: {
    photos: ScanPhoto[];
    labelText?: string | null;
    result: InterpretLabelsResult;
    listing?: Partial<ListingDraft>;
  }): ScannedItem;
  updateListing(id: string, patch: Partial<ListingDraft>): void;
  addDraftPhoto(photo: ScanPhoto): void;
  setDraftLabel(uri: string, text: string): void;
  clearDraft(): void;
  clear(): void;
};

/** Client-side list of scans for this session. Cleared with the rest of the user data. */
export function createScanStore(clock: Clock): ScanStore {
  const store = createStore<ScanState>()(() => ({ items: [], draft: emptyCaptureDraft() }));
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
        labelText: input.labelText ?? null,
        result: input.result,
        listing: applyListingPatch(emptyListing(), input.listing ?? {}),
      };
      store.setState((state) => ({ items: [item, ...state.items], draft: emptyCaptureDraft() }));
      return item;
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
    addDraftPhoto(photo) {
      store.setState((state) => ({ draft: addCapturePhoto(state.draft, photo) }));
    },
    setDraftLabel(uri, text) {
      store.setState((state) => ({ draft: setCaptureLabel(state.draft, uri, text) }));
    },
    clearDraft() {
      store.setState({ draft: emptyCaptureDraft() });
    },
    clear() {
      store.setState({ items: [], draft: emptyCaptureDraft() });
    },
  };
}
