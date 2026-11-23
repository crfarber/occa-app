import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacingX, spacingY, type } from '@/shared/ui/theme';

/** One row in the settings list: icon, label, chevron. */
export function SettingsMenuRow({
  label,
  icon,
  onPress,
  showDivider,
}: {
  label: string;
  icon: ReactNode;
  onPress: () => void;
  showDivider?: boolean;
}) {
  return (
    <View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={onPress}
        style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      >
        <View style={styles.leading}>{icon}</View>
        <Text style={styles.label}>{label}</Text>
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      </Pressable>
      {showDivider ? <View style={styles.divider} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacingX.md,
    paddingVertical: spacingY.lg,
    paddingHorizontal: spacingX.md,
    backgroundColor: colors.background,
  },
  pressed: { opacity: 0.7 },
  leading: { width: spacingX.xl + spacingX.xs, alignItems: 'center', justifyContent: 'center' },
  label: { ...type.labelMd, flex: 1, color: colors.text },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginLeft: spacingX.md,
  },
});
