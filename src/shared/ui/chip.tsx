import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, radius, spacingX, spacingY, type } from './theme';

type ChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  accessibilityLabel?: string;
};

/** Selectable outline chip for filter groups. */
export function Chip({ label, selected, onPress, accessibilityLabel }: ChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={accessibilityLabel ?? label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected ? styles.selected : styles.outline,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.label, selected ? styles.selectedLabel : styles.outlineLabel]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: radius.xxl,
    paddingHorizontal: spacingX.md,
    paddingVertical: spacingY.sm,
    borderWidth: 1,
  },
  outline: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  selected: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  pressed: { opacity: 0.7 },
  label: { ...type.label },
  outlineLabel: { color: colors.text },
  selectedLabel: { color: colors.onBrand },
});
