import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacingX, spacingY, type } from './theme';

export const pillTones = {
  neutral: { backgroundColor: colors.textMuted, color: colors.background },
  success: { backgroundColor: colors.success, color: colors.background },
  warning: { backgroundColor: colors.warning, color: colors.onWarning },
  danger: { backgroundColor: colors.danger, color: colors.background },
  brand: { backgroundColor: colors.brand, color: colors.onBrand },
} as const;

export type PillTone = keyof typeof pillTones;

export function Pill({ label, tone = 'neutral' }: { label: string; tone?: PillTone }) {
  const { backgroundColor, color } = pillTones[tone];
  return (
    <View style={[styles.pill, { backgroundColor }]}>
      <Text style={[styles.label, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    borderRadius: radius.xxl,
    paddingHorizontal: spacingX.md,
    paddingVertical: spacingY.xs,
  },
  label: {
    ...type.label,
  },
});
