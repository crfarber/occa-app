import type { ReactNode, Ref } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { GlassSurface } from './glass-surface';
import { colors, radius, size, spacingX, type } from './theme';

type PillFieldProps = Pick<
  TextInputProps,
  | 'value'
  | 'onChangeText'
  | 'placeholder'
  | 'accessibilityLabel'
  | 'editable'
  | 'returnKeyType'
  | 'onSubmitEditing'
  | 'submitBehavior'
  | 'onFocus'
  | 'onBlur'
> & {
  icon?: ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  inputRef?: Ref<TextInput>;
};

/** Pill search/input field. Uses liquid glass when available; solid white otherwise. */
export function PillField({
  icon,
  containerStyle,
  accessibilityLabel,
  inputRef,
  ...input
}: PillFieldProps) {
  return (
    <GlassSurface style={[styles.container, containerStyle]}>
      {icon ? <View style={styles.icon}>{icon}</View> : null}
      <TextInput
        ref={inputRef}
        accessibilityLabel={accessibilityLabel ?? input.placeholder}
        autoCapitalize="none"
        autoCorrect={false}
        placeholderTextColor={colors.textMuted}
        style={styles.input}
        {...input}
      />
    </GlassSurface>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacingX.sm,
    height: size.control,
    paddingHorizontal: spacingX.xl,
    borderRadius: radius.xxl,
    overflow: 'hidden',
  },
  icon: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    padding: 0,
    ...type.labelLg,
    color: colors.text,
  },
});
