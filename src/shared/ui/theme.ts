import {
  color,
  fontFamily,
  radius as tokenRadius,
  screenGutter,
  space,
  spaceX,
  text,
} from './remi-tokens';

export { color, fontFamily, motion, shadowRN, size, text, tokens } from './remi-tokens';

export const colors = {
  brand: color.plum,
  onBrand: color.onPlum,
  action: color.plum,
  onAction: color.onPlum,
  inverseSurface: color.ink,
  onInverseSurface: color.surface,
  background: color.surface,
  canvas: color.canvas,
  surface: color.surface,
  buttonLight: color.surface,
  secondaryButton: color.plumSoft,
  inputFill: color.surfaceSunken,
  text: color.ink,
  textMuted: color.inkMuted,
  border: color.line,
  danger: color.status.geweigerd.ink,
  dangerSurface: color.status.geweigerd.soft,
  warning: color.accent.amber,
  onWarning: color.ink,
  warningSurface: color.status.geweigerd.soft,
  success: color.status.bevestigd.ink,
  overlay: color.scrim,
} as const;

/**
 * Two scales with the same step names (ADR 0020). `spacingX` for widths and anything left/right,
 * `spacingY` for heights and anything top/bottom. A uniform `padding` or `margin` is split into
 * `paddingHorizontal` + `paddingVertical`; a `gap` follows the direction of its container.
 */
export const spacingX = {
  xs: spaceX[1],
  sm: spaceX[2],
  md: spaceX[3],
  lg: spaceX[4],
  xl: spaceX[5],
  xxl: spaceX[8],
  xxxl: spaceX[10],
  screen: screenGutter,
} as const;

export const spacingY = {
  xxs: space[0.5],
  xs: space[1],
  sm: space[2],
  md: space[3],
  lg: space[4],
  xl: space[6],
  xxl: space[8],
  xxxl: space[12],
  screen: screenGutter,
} as const;

export const radius = {
  sm: tokenRadius.sm,
  md: tokenRadius.md,
  lg: tokenRadius.lg,
  xl: tokenRadius.lg,
  xxl: tokenRadius.pill,
} as const;

export const type = {
  small: { ...text.caption, fontFamily: fontFamily.sansRN[500] },
  label: { ...text.labelMd, fontFamily: fontFamily.sansRN[500] },
  statusLabel: { ...text.label, fontFamily: fontFamily.sansRN[500] },
  body: { ...text.body, fontFamily: fontFamily.sansRN[400] },
  bodySm: { ...text.bodySm, fontFamily: fontFamily.sansRN[400] },
  labelMd: { ...text.labelMd, fontFamily: fontFamily.sansRN[500] },
  labelLg: { ...text.labelLg, fontFamily: fontFamily.sansRN[500] },
  header: { ...text.heading, fontFamily: fontFamily.sansRN[500] },
  large: { ...text.title, fontFamily: fontFamily.sansRN[500] },
  emphasis: { ...text.emphasis, fontFamily: fontFamily.sansRN[700] },
} as const;
