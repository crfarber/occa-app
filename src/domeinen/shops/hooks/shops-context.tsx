import { useQuery } from '@tanstack/react-query';
import { createContext, useContext, type ReactNode } from 'react';
import { useStore } from 'zustand';
import type { ShopStoresApi } from '../api/shop-stores';
import type { SelectedStoreStore } from '../store/selected-store-store';

export type ShopsContextValue = {
  shopsApi: ShopStoresApi;
  selectedStore: SelectedStoreStore;
};

const ShopsContext = createContext<ShopsContextValue | null>(null);

export function ShopsProvider({
  value,
  children,
}: {
  value: ShopsContextValue;
  children: ReactNode;
}) {
  return <ShopsContext.Provider value={value}>{children}</ShopsContext.Provider>;
}

function useShopsContext(): ShopsContextValue {
  const value = useContext(ShopsContext);
  if (value === null) {
    throw new Error('ShopsProvider is missing');
  }
  return value;
}

export function useSelectedStoreId(): string | null {
  const { selectedStore } = useShopsContext();
  return useStore(selectedStore.store, (state) => state.storeId);
}

export function useSelectStore(): (storeId: string) => Promise<void> {
  return useShopsContext().selectedStore.choose;
}

export const shopsQueryKey = ['shops', 'stores'] as const;

export function useMyStores() {
  const { shopsApi } = useShopsContext();
  return useQuery({
    queryKey: shopsQueryKey,
    queryFn: () => shopsApi.list(),
  });
}
