import { ActivityIndicator, Pressable, StyleSheet, Text, type ViewStyle } from 'react-native';
import { colors, fontFamily, radius, size, spacingX, spacingY, text } from './theme';

type ButtonVariant = 'primary' | 'secondary' | 'action' | 'danger' | 'light' | 'ghost' | 'text';

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
};

const VARIANT_STYLE = {
  primary: 'primary',
  secondary: 'secondary',
  action: 'action',
  danger: 'danger',
  light: 'light',
  ghost: 'ghost',
  text: 'text',
} as const satisfies Record<ButtonVariant, ButtonVariant>;

const SPINNER_COLOR: Record<ButtonVariant, string> = {
  primary: colors.onBrand,
  secondary: colors.text,
  action: colors.onAction,
  danger: colors.background,
  light: colors.text,
  ghost: colors.text,
  text: colors.action,
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
}: ButtonProps) {
  const inactive = disabled || loading;

  if (variant === 'text') {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: inactive, busy: loading }}
        disabled={inactive}
        onPress={onPress}
        style={({ pressed }) => [
          styles.textButton,
          (pressed || inactive) && styles.textButtonDimmed,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={SPINNER_COLOR.text} style={{ height: 20 }} />
        ) : (
          <Text style={styles.textButtonLabelUnderline}>{label}</Text>
        )}
      </Pressable>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        styles[VARIANT_STYLE[variant]],
        (pressed || inactive) && styles.dimmed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={SPINNER_COLOR[variant]} />
      ) : (
        <Text
          style={[
            styles.label,
            variant === 'secondary' && styles.secondaryLabel,
            variant === 'danger' && styles.dangerLabel,
            variant === 'light' && styles.lightLabel,
            variant === 'ghost' && styles.ghostLabel,
            variant === 'action' && styles.actionLabel,
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: size.touchMin,
    borderRadius: radius.xxl,
    paddingHorizontal: spacingX.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: { backgroundColor: colors.brand },
  secondary: { backgroundColor: colors.secondaryButton },
  danger: { backgroundColor: colors.danger },
  ghost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.text },
  action: { backgroundColor: colors.action },
  light: {
    backgroundColor: colors.buttonLight,
    borderRadius: radius.xxl,
    paddingVertical: spacingY.lg,
  },
  dimmed: { opacity: 0.6 },
  label: { ...text.labelMd, fontFamily: fontFamily.sansRN[500], color: colors.onBrand },
  secondaryLabel: { color: colors.text },
  dangerLabel: { color: colors.background },
  actionLabel: { color: colors.onAction, fontWeight: '700' },
  lightLabel: { color: colors.text, fontWeight: '700' },
  ghostLabel: { color: colors.text, fontWeight: '700' },
  textButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
    paddingVertical: 0,
    minHeight: undefined,
    borderRadius: 0,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  textButtonDimmed: { opacity: 0.6 },
  textButtonLabel: {
    color: colors.action,
    ...text.labelMd,
    fontFamily: fontFamily.sansRN[500],
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  textButtonLabelUnderline: {
    color: colors.action,
    ...text.labelMd,
    fontFamily: fontFamily.sansRN[500],
    paddingHorizontal: 0,
    paddingVertical: 0,
    textDecorationLine: 'underline',
  },
});
