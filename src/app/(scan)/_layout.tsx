import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { defaultStackHeaderOptions } from '@/shared/ui/stack-header';

export default function ScanLayout() {
  const { t } = useTranslation();

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={defaultStackHeaderOptions}>
        <Stack.Screen name="scan" options={{ title: t('capture.title') }} />
      </Stack>
    </>
  );
}
