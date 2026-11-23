/** The React Native side of shops. Only routes and bootstrap import this file. */
export {
  ShopsProvider,
  useMyStores,
  useSelectStore,
  useSelectedStoreId,
  shopsQueryKey,
} from './hooks/shops-context';
export type { ShopsContextValue } from './hooks/shops-context';
