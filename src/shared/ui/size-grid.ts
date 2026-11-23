/**
 * The size grid every style follows (ADR 0020). Widths step by 5, heights by 4 (plus 2 for hairline
 * gaps). A size that spans both axes is split into a horizontal and a vertical value; squares and
 * circles (icon, dot, shutter) are measured by their height and use a `size` token.
 */
export const WIDTH_STEP = 5;
export const HEIGHT_STEP = 4;
export const HEIGHT_HAIRLINE = 2;

export function isWidthStep(value: number): boolean {
  return Number.isInteger(value) && value % WIDTH_STEP === 0;
}

export function isHeightStep(value: number): boolean {
  return (
    Number.isInteger(value) && (Math.abs(value) === HEIGHT_HAIRLINE || value % HEIGHT_STEP === 0)
  );
}

/** A uniform `padding`, `margin` or `gap` must fit both grids, otherwise it must be split per axis. */
export function isUniformStep(value: number): boolean {
  return isWidthStep(value) && isHeightStep(value);
}

export const WIDTH_PROPERTIES = [
  'width',
  'minWidth',
  'maxWidth',
  'paddingHorizontal',
  'paddingLeft',
  'paddingRight',
  'paddingStart',
  'paddingEnd',
  'marginHorizontal',
  'marginLeft',
  'marginRight',
  'marginStart',
  'marginEnd',
  'left',
  'right',
  'columnGap',
] as const;

export const HEIGHT_PROPERTIES = [
  'height',
  'minHeight',
  'maxHeight',
  'lineHeight',
  'paddingVertical',
  'paddingTop',
  'paddingBottom',
  'marginVertical',
  'marginTop',
  'marginBottom',
  'top',
  'bottom',
  'rowGap',
] as const;

export const UNIFORM_PROPERTIES = ['padding', 'margin', 'gap'] as const;

export type GridAxis = 'width' | 'height' | 'uniform';

const AXIS_BY_PROPERTY = new Map<string, GridAxis>([
  ...WIDTH_PROPERTIES.map((property) => [property, 'width'] as const),
  ...HEIGHT_PROPERTIES.map((property) => [property, 'height'] as const),
  ...UNIFORM_PROPERTIES.map((property) => [property, 'uniform'] as const),
]);

export function axisOf(property: string): GridAxis | null {
  return AXIS_BY_PROPERTY.get(property) ?? null;
}

export function fitsGrid(property: string, value: number): boolean {
  if (value === 0) {
    return true;
  }
  switch (axisOf(property)) {
    case 'width':
      return isWidthStep(value);
    case 'height':
      return isHeightStep(value);
    case 'uniform':
      return isUniformStep(value);
    default:
      return true;
  }
}
