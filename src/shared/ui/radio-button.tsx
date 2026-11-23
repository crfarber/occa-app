import { colors, size, spacingX, type } from './theme';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

type RadioButtonProps = {
  selected: boolean;
  label?: string;
  onPress?: () => void;
  accessibilityLabel?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
};

export function RadioButton({
  selected,
  label,
  onPress,
  accessibilityLabel,
  disabled = false,
  style,
  labelStyle,
}: RadioButtonProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected, disabled }}
      accessibilityLabel={accessibilityLabel ?? label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.row, style, pressed && !disabled && styles.pressed]}
    >
      <View
        style={[styles.outer, selected && styles.outerSelected, disabled && styles.outerDisabled]}
      >
        {selected ? <View style={styles.inner} /> : null}
      </View>
      {label ? <Text style={[styles.label, labelStyle]}>{label}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacingX.md,
  },
  outer: {
    width: size.radio,
    height: size.radio,
    borderRadius: size.radio / 2,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  outerSelected: {
    borderColor: colors.text,
  },
  outerDisabled: {
    opacity: 0.5,
  },
  inner: {
    width: size.radioDot,
    height: size.radioDot,
    borderRadius: size.radioDot / 2,
    backgroundColor: colors.text,
  },
  label: {
    ...type.labelMd,
    color: colors.text,
  },
  pressed: {
    opacity: 0.8,
  },
});
