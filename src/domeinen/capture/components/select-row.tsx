import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, type } from '@/shared/ui/theme';

type SelectRowProps = {
  label: string;
  value: string;
  placeholder: string;
  onPress: () => void;
};

/** Tappable row that shows the current choice or a placeholder. */
export function SelectRow({ label, value, placeholder, onPress }: SelectRowProps) {
  const empty = value.trim() === '';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${empty ? placeholder : value}`}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.text}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.value, empty && styles.placeholder]} numberOfLines={1}>
          {empty ? placeholder : value}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: { opacity: 0.7 },
  text: { flex: 1, gap: spacing.xs },
  label: { ...type.small, color: colors.textMuted },
  value: { ...type.body, color: colors.text },
  placeholder: { color: colors.textMuted },
});
