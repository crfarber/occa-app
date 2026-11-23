import { useTranslation } from 'react-i18next';
import { KeyboardToolbar } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useKeyboardToolbarEnabled } from './keyboard-toolbar-context';
import { colors } from './theme';

const toolbarTheme = {
  light: {
    primary: colors.text,
    disabled: colors.textMuted,
    background: colors.surface,
    ripple: colors.border,
  },
  dark: {
    primary: colors.onInverseSurface,
    disabled: colors.textMuted,
    background: colors.inverseSurface,
    ripple: colors.border,
  },
} as const;

/**
 * One toolbar above the keyboard for the whole app: previous / next / done.
 * Mount once under `KeyboardProvider` and the i18n provider.
 * Disabled while a native search bar (or similar) asks to suppress it.
 */
export function KeyboardToolbarHost() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const enabled = useKeyboardToolbarEnabled();

  return (
    <KeyboardToolbar theme={toolbarTheme} insets={insets} opacity="FF" enabled={enabled}>
      <KeyboardToolbar.Prev />
      <KeyboardToolbar.Next />
      <KeyboardToolbar.Done text={t('common.keyboard.done')} />
    </KeyboardToolbar>
  );
}
