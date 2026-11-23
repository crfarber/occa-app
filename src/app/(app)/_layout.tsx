import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { defaultStackHeaderOptions } from '@/shared/ui/stack-header';

export default function AppLayout() {
  const { t } = useTranslation();

  return (
    <>
      <StatusBar style="light" />
      <Stack initialRouteName="(tabs)" screenOptions={defaultStackHeaderOptions}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="inventory/[id]" options={{ title: t('inventoryItem.title') }} />
        <Stack.Screen name="item/[id]" options={{ title: t('listing.title') }} />
        <Stack.Screen name="settings" options={{ title: t('settings.title') }} />
        <Stack.Screen name="language" options={{ title: t('settings.language.title') }} />
      </Stack>
    </>
  );
}
