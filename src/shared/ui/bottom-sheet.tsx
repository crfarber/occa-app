import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState, type ReactNode } from 'react';
import {
  Keyboard,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type KeyboardEvent,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconButton } from './icon-button';
import { keyboardOverlap, sheetSizeAboveKeyboard, type SheetSize } from './sheet-keyboard';
import { colors, radius, spacingX, spacingY, type } from './theme';

/**
 * Top of the keyboard while this sheet is open. `undefined` until the first observation,
 * `null` once the keyboard is known to be hidden.
 */
function useKeyboardScreenY(visible: boolean): number | null {
  const [screenY, setScreenY] = useState<number | null | undefined>(undefined);

  useEffect(() => {
    if (!visible) {
      return;
    }

    const showEvents =
      Platform.OS === 'ios'
        ? (['keyboardWillShow', 'keyboardDidShow'] as const)
        : (['keyboardDidShow'] as const);
    const hideEvents =
      Platform.OS === 'ios'
        ? (['keyboardWillHide', 'keyboardDidHide'] as const)
        : (['keyboardDidHide'] as const);
    const show = showEvents.map((eventName) =>
      Keyboard.addListener(eventName, (event: KeyboardEvent) => {
        Keyboard.scheduleLayoutAnimation(event);
        setScreenY(event.endCoordinates.screenY);
      }),
    );
    const hide = hideEvents.map((eventName) =>
      Keyboard.addListener(eventName, (event: KeyboardEvent) => {
        Keyboard.scheduleLayoutAnimation(event);
        setScreenY(null);
      }),
    );

    return () => {
      for (const subscription of [...show, ...hide]) {
        subscription.remove();
      }
      setScreenY(undefined);
    };
  }, [visible]);

  if (!visible) {
    return null;
  }
  if (screenY !== undefined) {
    return screenY;
  }
  return Keyboard.metrics()?.screenY ?? null;
}

/**
 * Generic bottom sheet: dimmed backdrop, sliding panel, title and a close control.
 * Domain sheets (select, service decline) compose on top of this.
 * The panel lifts above the keyboard so a search field does not cover the choices.
 */
export function BottomSheet({
  visible,
  title,
  subtitle,
  closeLabel,
  onClose,
  children,
  footer,
  height,
  showHandle = false,
  closeIcon = false,
}: {
  visible: boolean;
  title: string;
  /** Optional line(s) under the title, e.g. last-updated timestamps. */
  subtitle?: ReactNode;
  closeLabel: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  height?: SheetSize;
  /** Grey pill at the top of the panel. */
  showHandle?: boolean;
  /** Round icon close control instead of the text button. */
  closeIcon?: boolean;
}) {
  const { height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const keyboardScreenY = useKeyboardScreenY(visible);
  const keyboardInset = keyboardOverlap(windowHeight, keyboardScreenY);
  const aboveKeyboard = keyboardInset > 0;
  const limit = sheetSizeAboveKeyboard({
    windowHeight,
    keyboardInset,
    topInset: insets.top,
    requested: height,
  });
  const sized = height !== undefined;
  const fill = sized || aboveKeyboard;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={closeLabel}
          style={StyleSheet.absoluteFill}
          onPress={onClose}
        />
        <SafeAreaView
          style={[
            styles.sheet,
            aboveKeyboard ? { marginBottom: keyboardInset, overflow: 'hidden' } : null,
            fill ? { height: limit, maxHeight: limit } : styles.maxHeight,
          ]}
          edges={aboveKeyboard ? [] : ['bottom']}
        >
          <View style={fill ? styles.sheetColumn : undefined}>
            {showHandle ? <View style={styles.handle} accessibilityElementsHidden /> : null}
            <View style={styles.sheetHeader}>
              <View style={styles.titleBlock}>
                <Text style={styles.sheetTitle}>{title}</Text>
                {subtitle !== undefined && subtitle !== null ? (
                  typeof subtitle === 'string' || typeof subtitle === 'number' ? (
                    <Text style={styles.sheetSubtitle}>{subtitle}</Text>
                  ) : (
                    subtitle
                  )
                ) : null}
              </View>
              {closeIcon ? (
                <IconButton
                  accessibilityLabel={closeLabel}
                  onPress={onClose}
                  icon={<Ionicons name="close" size={20} color={colors.text} />}
                />
              ) : (
                <Pressable accessibilityRole="button" onPress={onClose} hitSlop={spacingY.md}>
                  <Text style={styles.closeLabel}>{closeLabel}</Text>
                </Pressable>
              )}
            </View>
            <View style={[styles.body, fill && styles.bodySized]}>{children}</View>
            {footer !== undefined ? <View style={styles.footer}>{footer}</View> : null}
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: colors.overlay },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.md,
    borderTopRightRadius: radius.md,
    paddingHorizontal: spacingX.md,
    paddingVertical: spacingY.sm,
    maxWidth: '100%',
    width: '100%',
  },
  sheetColumn: { flex: 1 },
  maxHeight: { maxHeight: '80%' },
  handle: {
    alignSelf: 'center',
    width: spacingX.xxxl,
    height: spacingY.xs,
    borderRadius: radius.xxl,
    backgroundColor: colors.border,
    marginTop: spacingY.xs,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: spacingY.md,
    gap: spacingX.md,
  },
  titleBlock: { flex: 1, gap: spacingY.xs },
  sheetTitle: { ...type.header, color: colors.text },
  sheetSubtitle: { ...type.bodySm, color: colors.textMuted },
  closeLabel: { ...type.labelMd, color: colors.textMuted, marginTop: spacingY.xxs },
  body: { flexShrink: 1, minHeight: 0 },
  bodySized: { flex: 1, minHeight: 0 },
  footer: { paddingVertical: spacingY.md, gap: spacingY.sm },
});
