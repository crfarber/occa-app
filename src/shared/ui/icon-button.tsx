import type { ReactNode } from 'react';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { GlassSurface } from './glass-surface';
import { radius, size } from './theme';

type IconButtonProps = {
  transparent?: boolean;
  icon: ReactNode;
  accessibilityLabel: string;
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function IconButton({
  icon,
  accessibilityLabel,
  onPress,
  disabled = false,
  transparent = false,
  style,
}: IconButtonProps) {
  const button = (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      disabled={disabled}
      hitSlop={(size.touchMin - size.control) / 2}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        transparent && styles.transparent,
        pressed && styles.pressed,
        disabled && styles.disabled,
        !transparent ? null : style,
      ]}
    >
      {icon}
    </Pressable>
  );

  if (transparent) {
    return button;
  }

  return <GlassSurface style={[styles.chip, style]}>{button}</GlassSurface>;
}

const styles = StyleSheet.create({
  chip: {
    width: size.control,
    height: size.control,
    borderRadius: radius.xxl,
    overflow: 'hidden',
  },
  button: {
    width: size.control,
    height: size.control,
    borderRadius: radius.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.7 },
  disabled: { opacity: 0.45 },
  transparent: { backgroundColor: 'transparent' },
});
