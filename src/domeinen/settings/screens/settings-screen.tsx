import { useState } from 'react';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuthService } from '@/domeinen/auth/ui';
import { Button } from '@/shared/ui/button';
import { Screen } from '@/shared/ui/screen';
import { colors, spacingX, spacingY, type } from '@/shared/ui/theme';
import { SettingsMenuRow } from '../components/settings-menu-row';

const appVersion = Constants.expoConfig?.version ?? '';

type MenuItem = {
  key: string;
  labelKey: 'settings.language.title';
  route: '/language';
  icon: keyof typeof Ionicons.glyphMap;
};

const MENU_ITEMS: readonly MenuItem[] = [
  {
    key: 'language',
    labelKey: 'settings.language.title',
    route: '/language',
    icon: 'globe-outline',
  },
];

/** Language settings, sign-out, and the app version. */
export function SettingsScreen() {
  const { t } = useTranslation();
  const authService = useAuthService();
  const [signingOut, setSigningOut] = useState(false);

  const onSignOut = async () => {
    setSigningOut(true);
    try {
      await authService.signOut();
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <Screen contentStyle={styles.content}>
      <Text style={styles.section}>{t('settings.section.general')}</Text>
      <View style={styles.list}>
        {MENU_ITEMS.map((item, index) => (
          <SettingsMenuRow
            key={item.key}
            label={t(item.labelKey)}
            icon={<Ionicons name={item.icon} size={20} color={colors.text} />}
            onPress={() => router.push(item.route)}
            showDivider={index < MENU_ITEMS.length - 1}
          />
        ))}
      </View>

      <Text style={styles.section}>{t('settings.section.account')}</Text>
      <View style={styles.signOutWrap}>
        <Button
          label={signingOut ? t('feedback.processing.signOut') : t('common.signOut')}
          variant="danger"
          loading={signingOut}
          onPress={() => void onSignOut()}
        />
      </View>

      <View style={styles.versionWrap}>
        <Text style={styles.version}>{appVersion}</Text>
      </View>
    </Screen>
  );
}

/** Cog in the stack header; opens the settings screen. */
export function SettingsHeaderButton() {
  const { t } = useTranslation();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('settings.open')}
      onPress={() => router.push('/settings')}
      style={({ pressed }) => [styles.headerButton, pressed && styles.headerButtonPressed]}
      hitSlop={spacingY.sm}
    >
      <Ionicons name="cog-outline" size={24} color={colors.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { padding: 0, gap: 0 },
  section: {
    marginTop: spacingY.xl,
    marginBottom: spacingY.sm,
    paddingHorizontal: spacingX.md,
    ...type.small,
    textTransform: 'uppercase',
    color: colors.textMuted,
  },
  list: { backgroundColor: colors.background },
  signOutWrap: {
    paddingHorizontal: spacingX.md,
    paddingTop: spacingY.sm,
  },
  versionWrap: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingVertical: spacingY.xl,
  },
  version: { ...type.small, color: colors.textMuted, textAlign: 'center' },
  headerButton: { paddingHorizontal: spacingX.sm, paddingVertical: spacingY.xs },
  headerButtonPressed: { opacity: 0.6 },
});
