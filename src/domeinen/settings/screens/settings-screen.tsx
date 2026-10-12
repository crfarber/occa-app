import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/shared/ui/screen';
import { colors, spacing } from '@/shared/ui/theme';
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

/** Language settings and the app version. */
export function SettingsScreen() {
  const { t } = useTranslation();

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
      hitSlop={spacing.sm}
    >
      <Ionicons name="cog-outline" size={24} color={colors.onBrand} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { padding: 0, gap: 0 },
  section: {
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: colors.textMuted,
  },
  list: { backgroundColor: colors.background },
  versionWrap: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  version: { fontSize: 12, color: colors.textMuted, textAlign: 'center' },
  headerButton: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },
  headerButtonPressed: { opacity: 0.6 },
});
