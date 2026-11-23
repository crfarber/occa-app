import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createContext, useContext, type ReactNode } from 'react';
import type { ShopItemDetailApi, ShopItemPatch } from '../api/shop-item-detail';
import { SHOP_ITEMS_PAGE_SIZE, type ShopItemsApi } from '../api/shop-items';
import { toItemsQuery, type InventoryFilter } from '../domain/inventory-filter';

export type InventoryContextValue = {
  itemsApi: ShopItemsApi;
  itemDetailApi: ShopItemDetailApi;
};

const InventoryContext = createContext<InventoryContextValue | null>(null);

export function InventoryProvider({
  value,
  children,
}: {
  value: InventoryContextValue;
  children: ReactNode;
}) {
  return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>;
}

function useInventoryContext(): InventoryContextValue {
  const value = useContext(InventoryContext);
  if (value === null) {
    throw new Error('InventoryProvider is missing');
  }
  return value;
}

export function inventoryQueryKey(storeId: string) {
  return ['inventory', storeId] as const;
}

export function inventoryListQueryKey(storeId: string, search: string, filter: InventoryFilter) {
  // `paged` busts pre-pagination cache that stored a flat `{ items }` payload.
  return ['inventory', storeId, 'list', 'paged', search, filter] as const;
}

export function inventoryFiltersQueryKey(storeId: string, locale: string) {
  return ['inventory', storeId, 'filters', locale] as const;
}

export function inventoryItemQueryKey(storeId: string, itemId: string) {
  return ['inventory', storeId, 'item', itemId] as const;
}

export function itemOptionsQueryKey(category: string | null, doelgroep: string | null) {
  return ['inventory', 'options', category ?? '', doelgroep ?? ''] as const;
}

export function useInventoryItems(storeId: string | null, search: string, filter: InventoryFilter) {
  const { itemsApi } = useInventoryContext();
  return useInfiniteQuery({
    queryKey: inventoryListQueryKey(storeId ?? '', search, filter),
    queryFn: ({ pageParam }) => {
      if (storeId === null) {
        throw new Error('No store selected');
      }
      return itemsApi.list(storeId, {
        ...toItemsQuery(search, filter),
        limit: SHOP_ITEMS_PAGE_SIZE,
        offset: pageParam,
      });
    },
    initialPageParam: 0,
    getNextPageParam: (last) => {
      if (last.page.hasMore !== true) return undefined;
      return last.page.offset + last.page.limit;
    },
    enabled: storeId !== null,
  });
}

export function useInventoryFilters(storeId: string | null, locale: string, enabled: boolean) {
  const { itemsApi } = useInventoryContext();
  return useQuery({
    queryKey: inventoryFiltersQueryKey(storeId ?? '', locale),
    queryFn: () => {
      if (storeId === null) {
        throw new Error('No store selected');
      }
      return itemsApi.filters(storeId, locale);
    },
    enabled: storeId !== null && enabled,
    staleTime: 60_000,
  });
}

export function useInventoryItem(storeId: string | null, itemId: string) {
  const { itemDetailApi } = useInventoryContext();
  return useQuery({
    queryKey: inventoryItemQueryKey(storeId ?? '', itemId),
    queryFn: () => {
      if (storeId === null) {
        throw new Error('No store selected');
      }
      return itemDetailApi.get(storeId, itemId);
    },
    enabled: storeId !== null && itemId.length > 0,
  });
}

export function useItemOptions(category: string | null, doelgroep: string | null) {
  const { itemDetailApi } = useInventoryContext();
  return useQuery({
    queryKey: itemOptionsQueryKey(category, doelgroep),
    queryFn: () => itemDetailApi.options({ category, doelgroep }),
  });
}

export function useUpdateInventoryItem(storeId: string | null, itemId: string) {
  const { itemDetailApi } = useInventoryContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (patch: ShopItemPatch) => {
      if (storeId === null) {
        throw new Error('No store selected');
      }
      return itemDetailApi.update(storeId, itemId, patch);
    },
    onSuccess: (detail) => {
      if (storeId === null) return;
      queryClient.setQueryData(inventoryItemQueryKey(storeId, itemId), detail);
      void queryClient.invalidateQueries({ queryKey: inventoryQueryKey(storeId) });
    },
  });
}
