import { createContext, useContext, type ReactNode } from 'react';
import { useStore } from 'zustand';
import type { ListingDraft } from '../domain/listing';
import type { ImageClassifier } from '../service/image-classifier';
import type { ImageColorSampler } from '../service/image-color-sampler';
import type { ScanState, ScanStore, ScannedItem } from '../store/scan-store';

export type CaptureContextValue = {
  imageClassifier: ImageClassifier;
  imageColorSampler: ImageColorSampler;
  scanStore: ScanStore;
};

const CaptureContext = createContext<CaptureContextValue | null>(null);

/** Supplied by `bootstrap/providers.tsx`. The domain never creates its own dependencies. */
export function CaptureProvider({
  value,
  children,
}: {
  value: CaptureContextValue;
  children: ReactNode;
}) {
  return <CaptureContext.Provider value={value}>{children}</CaptureContext.Provider>;
}

function useCaptureContext(): CaptureContextValue {
  const value = useContext(CaptureContext);
  if (value === null) {
    throw new Error('CaptureProvider is missing');
  }
  return value;
}

export function useImageClassifier(): ImageClassifier {
  return useCaptureContext().imageClassifier;
}

export function useImageColorSampler(): ImageColorSampler {
  return useCaptureContext().imageColorSampler;
}

/** Scans recorded this session, newest first. */
export function useScans(): ScannedItem[] {
  const { scanStore } = useCaptureContext();
  return useStore(scanStore.store, (state: ScanState) => state.items);
}

export function useRecordScan(): ScanStore['record'] {
  return useCaptureContext().scanStore.record;
}

export function useScan(id: string): ScannedItem | null {
  const { scanStore } = useCaptureContext();
  return useStore(
    scanStore.store,
    (state: ScanState) => state.items.find((item) => item.id === id) ?? null,
  );
}

export function useUpdateListing(): (id: string, patch: Partial<ListingDraft>) => void {
  return useCaptureContext().scanStore.updateListing;
}
