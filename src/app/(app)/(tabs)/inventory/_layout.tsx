import { Stack } from 'expo-router';
import { defaultStackHeaderOptions } from '@/shared/ui/stack-header';

export default function InventoryStackLayout() {
  return <Stack screenOptions={defaultStackHeaderOptions} />;
}
