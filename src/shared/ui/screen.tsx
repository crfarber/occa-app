import { useState, type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { KeyboardAwareScrollView, KeyboardStickyView } from 'react-native-keyboard-controller';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { HeaderBlurTarget, useHeaderBlur } from './glass-header';
import { ScreenFooter } from './screen-footer';
import { systemAdjustsHeaderInset } from './stack-header';
import { colors, spacingX, spacingY } from './theme';

/** Space above the keyboard for the global toolbar + a little breathing room. */
const KEYBOARD_TOOLBAR_OFFSET = 48;

/**
 * A screen with a keyboard-aware scrollable body. An optional footer sticks above
 * the keyboard and owns the bottom safe area; without one, the SafeAreaView keeps
 * that inset. Top inset is skipped by default: the stack header already covers the
 * status bar, and a floating header lets the body scroll beneath it. Set
 * `safeAreaTop` when there is no header (e.g. login).
 * Set `scroll={false}` when a child owns scrolling (e.g. sticky search + list); that
 * child then offsets itself below the floating header (see `useHeaderInset`).
 */
export function Screen({
  children,
  footer,
  contentStyle,
  backgroundColor = colors.canvas,
  scroll = true,
  safeAreaTop = false,
  safeAreaBottom = true,
  keyboardMode = 'insets',
  floatingHeader = true,
}: {
  children: ReactNode;
  footer?: ReactNode;
  /** Merged onto the default padded content container (e.g. full-bleed lists). */
  contentStyle?: StyleProp<ViewStyle>;
  /** Page background. Keep it opaque: a transparent screen shows the previous one while pushing. */
  backgroundColor?: string;
  /** When false, the body fills the screen and does not scroll. */
  scroll?: boolean;
  /** Include the top safe-area inset (screens without a stack header). */
  safeAreaTop?: boolean;
  /**
   * Include the bottom safe-area inset. Set false when content scrolls under a
   * floating tab bar and the list already pads for the home indicator.
   */
  safeAreaBottom?: boolean;
  /**
   * How the keyboard creates space in the scroll view.
   * Use `layout` when flex distribution must reflow (e.g. login form).
   */
  keyboardMode?: 'insets' | 'layout';
  /** Set false when the screen overrides the header with an opaque bar (e.g. capture). */
  floatingHeader?: boolean;
}) {
  const [footerHeight, setFooterHeight] = useState(0);
  const insets = useSafeAreaInsets();
  const blur = useHeaderBlur(floatingHeader);
  const adjustsInsets = scroll && floatingHeader && systemAdjustsHeaderInset;
  // Automatic inset adjustment already adds the home-indicator inset that the footer pads for.
  const footerInset = footer ? Math.max(0, footerHeight - (adjustsInsets ? insets.bottom : 0)) : 0;
  const topPad = scroll && blur.headerInset > 0 ? blur.headerInset + paddingTopOf(contentStyle) : 0;
  const bodyStyle = [
    styles.content,
    contentStyle,
    topPad > 0 ? { paddingTop: topPad } : null,
    footer ? { paddingBottom: footerInset + spacingY.md } : null,
  ];
  const edges = [
    ...(safeAreaTop ? (['top'] as const) : []),
    ...(footer || !safeAreaBottom ? [] : (['bottom'] as const)),
  ];

  return (
    <HeaderBlurTarget blur={blur}>
      <SafeAreaView style={[styles.safeArea, { backgroundColor }]} edges={edges}>
        {scroll ? (
          <KeyboardAwareScrollView
            contentContainerStyle={bodyStyle}
            contentInsetAdjustmentBehavior={adjustsInsets ? 'automatic' : 'never'}
            scrollIndicatorInsets={{ bottom: footerInset }}
            keyboardShouldPersistTaps="handled"
            bottomOffset={KEYBOARD_TOOLBAR_OFFSET + (footer ? footerHeight : 0) + spacingY.md}
            mode={keyboardMode}
            style={styles.scroll}
          >
            {children}
          </KeyboardAwareScrollView>
        ) : (
          <View style={[bodyStyle, styles.fill]}>{children}</View>
        )}
        {footer ? (
          <KeyboardStickyView style={styles.footerOverlay}>
            <View onLayout={(event) => setFooterHeight(event.nativeEvent.layout.height)}>
              <ScreenFooter>{footer}</ScreenFooter>
            </View>
          </KeyboardStickyView>
        ) : null}
      </SafeAreaView>
    </HeaderBlurTarget>
  );
}

/** The top padding React Native resolves for the content container. */
function paddingTopOf(contentStyle: StyleProp<ViewStyle>): number {
  const flat: ViewStyle = StyleSheet.flatten([styles.content, contentStyle]);
  const value = flat.paddingTop ?? flat.paddingVertical ?? flat.padding;
  return typeof value === 'number' ? value : 0;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: spacingX.screen,
    paddingVertical: spacingY.md,
    gap: spacingY.md,
    flexGrow: 1,
  },
  fill: { flex: 1, minHeight: 0 },
  footerOverlay: { position: 'absolute', left: 0, right: 0, bottom: 0 },
});
