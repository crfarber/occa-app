import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radius, spacing, type } from '@/shared/ui/theme';
import type { Rect } from '../domain/frame-crop';

type FrameOverlayProps = {
  frame: Rect;
  /** Short label under the top edge of the frame (e.g. colour sample hint). */
  label: string;
  style?: StyleProp<ViewStyle>;
};

/**
 * Dims everything outside the alignment frame and draws a clear border so the
 * employee sees which area becomes the cropped photo / dominant colour.
 */
export function FrameOverlay({ frame, label, style }: FrameOverlayProps) {
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, style]}>
      <View style={[styles.dim, { height: Math.max(0, frame.y) }]} />
      <View style={[styles.middleRow, { height: frame.height }]}>
        <View style={[styles.dim, { width: Math.max(0, frame.x) }]} />
        <View style={[styles.frame, { width: frame.width, height: frame.height }]}>
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />
          <Text style={styles.label}>{label}</Text>
        </View>
        <View style={styles.dimFlex} />
      </View>
      <View style={styles.dimFlex} />
    </View>
  );
}

const CORNER = 22;
const STROKE = 3;

const styles = StyleSheet.create({
  dim: {
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  dimFlex: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  middleRow: {
    flexDirection: 'row',
  },
  frame: {
    borderColor: colors.onInverseSurface,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.sm,
    overflow: 'hidden',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  label: {
    ...type.small,
    color: colors.onInverseSurface,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: 'rgba(0,0,0,0.45)',
    overflow: 'hidden',
    borderRadius: radius.sm,
    textAlign: 'center',
  },
  corner: {
    position: 'absolute',
    width: CORNER,
    height: CORNER,
    borderColor: colors.onInverseSurface,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: STROKE,
    borderLeftWidth: STROKE,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: STROKE,
    borderRightWidth: STROKE,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: STROKE,
    borderLeftWidth: STROKE,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: STROKE,
    borderRightWidth: STROKE,
  },
});
