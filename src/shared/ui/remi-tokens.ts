import palette from './remi-palette.json';

export const color = {
  canvas: '#f4f2ef',
  surface: '#ffffff',
  surfaceSunken: '#f8f7f5',
  surfaceMuted: '#efece8',
  line: '#e9e5e0',
  lineControl: '#8a8086',
  ink: '#231a22',
  inkMuted: '#6b6166',
  inkSubtle: '#a39aa0',
  plum: palette.plum,
  plumSoft: '#efe4ec',
  onPlum: '#ffffff',
  carmine: '#b0203f',
  carmineStrong: '#911933',
  onCarmine: '#ffffff',
  remiYellow: palette.remiYellow,
  status: {
    aangevraagd: { bg: '#5b82cf', fg: '#ffffff', soft: '#e5ebf7', ink: '#2c529c', dot: '#4f78c8' },
    bevestigd: { bg: '#5e8a54', fg: '#ffffff', soft: '#e6eee2', ink: '#3b5a34', dot: '#5e8a54' },
    opgehaald: { bg: '#4a274c', fg: '#efe4ec', soft: '#efe4ec', ink: '#4a274c', dot: '#efe4ec' },
    geweigerd: { bg: '#d9692f', fg: '#ffffff', soft: '#fae7da', ink: '#9c4216', dot: '#d0622a' },
    verlopen: { bg: '#efece8', fg: '#6b6166', soft: '#efece8', ink: '#6b6166', dot: '#a39aa0' },
    concept: { bg: '#4a274c', fg: '#ffffff', soft: '#efe4ec', ink: '#4a274c', dot: '#ffffff' },
  },
  accent: {
    sage: '#a9bba2',
    rose: '#dcb3be',
    roseSoft: '#f6e8ec',
    blue: '#5b82cf',
    amber: '#d9692f',
    forest: '#1f3a32',
  },
  scrim: 'rgba(0,0,0,0.25)',
  dotInactive: '#d9d9d9',
  focus: '#4a274c',
} as const;

/** Vertical steps: 2, or a multiple of 4. */
export const space = { 0.5: 2, 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 12: 48 } as const;
/** Horizontal steps: multiples of 5. */
export const spaceX = { 1: 5, 2: 10, 3: 15, 4: 20, 5: 25, 6: 30, 8: 40, 10: 50 } as const;
export const screenGutter = 20;
export const radius = { sm: 8, md: 14, lg: 24, pill: 999 } as const;
/** Heights, and squares or circles (measured by their height). */
export const size = {
  touchMin: 48,
  touchShop: 56,
  control: 44,
  tabBar: 64,
  chipHeight: 28,
  tagHeight: 24,
  dot: 8,
  radio: 20,
  radioDot: 8,
  thumbnail: 72,
  shutter: 72,
  shutterInner: 64,
  logoWidth: 260,
  logoHeight: 96,
} as const;

export const fontFamily = {
  sansRN: {
    400: 'PlusJakartaSans_400Regular',
    500: 'PlusJakartaSans_500Medium',
    700: 'PlusJakartaSans_700Bold',
  },
} as const;

export const text = {
  display: { fontSize: 48, lineHeight: 52, fontWeight: 500, letterSpacing: -0.96 },
  title: { fontSize: 28, lineHeight: 36, fontWeight: 500 },
  heading: { fontSize: 20, lineHeight: 28, fontWeight: 500 },
  bodyLg: { fontSize: 18, lineHeight: 28, fontWeight: 400 },
  body: { fontSize: 16, lineHeight: 24, fontWeight: 400 },
  bodySm: { fontSize: 14, lineHeight: 20, fontWeight: 400 },
  labelLg: { fontSize: 18, lineHeight: 24, fontWeight: 500 },
  labelMd: { fontSize: 16, lineHeight: 20, fontWeight: 500 },
  label: { fontSize: 14, lineHeight: 20, fontWeight: 500, textTransform: 'uppercase' as const },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: 500 },
  figure: { fontSize: 40, lineHeight: 44, fontWeight: 700, letterSpacing: -0.8 },
  emphasis: { fontSize: 16, lineHeight: 24, fontWeight: 700 },
} as const;

export const shadowRN = {
  card: {
    shadowColor: '#231a22',
    shadowOpacity: 0.04,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  raised: {
    shadowColor: '#231a22',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
} as const;

export const motion = { fast: 120, base: 200, sheet: 280 } as const;

export const tokens = {
  color,
  space,
  spaceX,
  screenGutter,
  radius,
  size,
  fontFamily,
  text,
  shadowRN,
  motion,
} as const;
export type ReservationStatus = keyof typeof color.status;
