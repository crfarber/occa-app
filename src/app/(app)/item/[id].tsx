import { useLocalSearchParams } from 'expo-router';
import { ListingScreen } from '@/domeinen/capture/ui';

export default function ItemRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const itemId = Array.isArray(id) ? (id[0] ?? '') : (id ?? '');
  return <ListingScreen itemId={itemId} />;
}
