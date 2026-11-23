import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SettingsHeaderButton } from '@/domeinen/settings/ui';
import { defaultStackHeaderOptions } from '@/shared/ui/stack-header';

export default function HomeStackLayout() {
  const { t } = useTranslation();

  return (
    <Stack screenOptions={defaultStackHeaderOptions}>
      <Stack.Screen
        name="index"
        options={{
          title: t('home.title'),
          headerRight: () => <SettingsHeaderButton />,
        }}
      />
    </Stack>
  );
}
