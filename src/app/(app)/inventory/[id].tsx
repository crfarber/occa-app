import { useLocalSearchParams } from 'expo-router';
import { InventoryItemScreen } from '@/domeinen/inventory/ui';

export default function InventoryItemRoute() {
  const params = useLocalSearchParams<{ id: string }>();
  const id = typeof params.id === 'string' ? params.id : '';
  return <InventoryItemScreen itemId={id} />;
}
