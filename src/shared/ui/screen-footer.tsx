import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacingX, spacingY } from './theme';

/** Sticky action bar at the bottom of a screen. It owns the bottom safe area. */
export function ScreenFooter({
  children,
  backgroundColor = colors.background,
}: {
  children: ReactNode;
  backgroundColor?: string;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.footer, { backgroundColor, paddingBottom: spacingY.md + insets.bottom }]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    paddingHorizontal: spacingX.md,
    paddingTop: spacingY.md,
    gap: spacingY.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
});
