import { BlurTargetView, BlurView } from 'expo-blur';
import { HeaderHeightContext, NavigationContext } from 'expo-router/react-navigation';
import { useContext, useLayoutEffect, useRef, type ReactNode, type RefObject } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { hasFloatingHeader, systemAdjustsHeaderInset } from './stack-header';

/**
 * Top space scroll content needs below a floating header on platforms that do not
 * adjust insets automatically (Android). 0 on iOS and when the header is solid.
 */
export function useHeaderInset(enabled = true): number {
  const navigation = useContext(NavigationContext);
  const headerHeight = useContext(HeaderHeightContext) ?? 0;
  const applies = enabled && hasFloatingHeader && !systemAdjustsHeaderInset;
  return applies && navigation !== undefined ? headerHeight : 0;
}

/**
 * On Android the floating header background is an expo-blur view over the screen
 * content. That content must render inside `HeaderBlurTarget` with the returned ref.
 */
export function useHeaderBlur(enabled = true) {
  const navigation = useContext(NavigationContext);
  const headerInset = useHeaderInset(enabled);
  const targetRef = useRef<View>(null);
  const active = Platform.OS === 'android' && headerInset > 0;

  useLayoutEffect(() => {
    if (!active || navigation === undefined) return;
    navigation.setOptions({
      headerBackground: () => <HeaderBlur targetRef={targetRef} />,
    });
  }, [active, navigation]);

  return { active, targetRef, headerInset };
}

export function HeaderBlurTarget({
  blur,
  children,
}: {
  blur: ReturnType<typeof useHeaderBlur>;
  children: ReactNode;
}) {
  if (!blur.active) return children;
  return (
    <BlurTargetView ref={blur.targetRef} style={styles.fill}>
      {children}
    </BlurTargetView>
  );
}

/**
 * Sticky section headers pin to the top of the list viewport. When a floating header
 * overlays that viewport (Android), pad the sticky header so its label clears the chrome.
 */
export function stickySectionHeaderStyle(headerInset: number, basePaddingTop = 0) {
  if (headerInset <= 0) return null;
  return {
    paddingTop: basePaddingTop + headerInset,
    marginTop: -headerInset,
  } as const;
}

function HeaderBlur({ targetRef }: { targetRef: RefObject<View | null> }) {
  return (
    <BlurView
      blurTarget={targetRef}
      blurMethod="dimezisBlurViewSdk31Plus"
      tint="systemThinMaterialLight"
      intensity={70}
      style={StyleSheet.absoluteFill}
    />
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
