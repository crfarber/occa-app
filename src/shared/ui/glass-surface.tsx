import { GlassView, isGlassEffectAPIAvailable, isLiquidGlassAvailable } from 'expo-glass-effect';
import { StyleSheet, View, type ViewProps } from 'react-native';
import { colors, shadowRN } from './theme';

/** True when native Liquid Glass can render without crashing (iOS 26+). */
export function isGlassSurfaceAvailable(): boolean {
  return isGlassEffectAPIAvailable() && isLiquidGlassAvailable();
}

type GlassSurfaceProps = ViewProps & {
  /** Opaque stand-in when glass is unavailable. Defaults to white surface + raised shadow. */
  fallbackStyle?: ViewProps['style'];
};

/**
 * Frosted / liquid-glass chrome on supported iOS; solid surface elsewhere.
 * Use for floating search pills, tab bars, and icon chips — not for solid brand fills.
 */
export function GlassSurface({ style, fallbackStyle, children, ...rest }: GlassSurfaceProps) {
  if (isGlassSurfaceAvailable()) {
    return (
      <GlassView glassEffectStyle="regular" style={style} {...rest}>
        {children}
      </GlassView>
    );
  }

  return (
    <View style={[styles.fallback, fallbackStyle, style]} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    backgroundColor: colors.surface,
    ...shadowRN.raised,
  },
});
