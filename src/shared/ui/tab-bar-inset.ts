import { size, spacingY } from './theme';

/**
 * Vertical space reserved above the home indicator for the floating tab bar
 * host (`paddingTop` + bar + `paddingBottom` without the safe-area inset).
 * Screens that scroll under the tab bar add `insets.bottom` themselves.
 */
export const TAB_BAR_CLEARANCE = spacingY.sm + size.tabBar + spacingY.md;
