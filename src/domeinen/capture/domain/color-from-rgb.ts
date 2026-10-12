/**
 * Maps an average RGB sample from a photo to a Dutch colour name used in the shop dropdown.
 * Anchors are approximate clothing colours under typical shop lighting.
 */

export type Rgb = { r: number; g: number; b: number };

type ColorAnchor = { name: string; r: number; g: number; b: number };

const ANCHORS: readonly ColorAnchor[] = [
  { name: 'zwart', r: 25, g: 25, b: 25 },
  { name: 'wit', r: 245, g: 245, b: 245 },
  /** Warm off-white — kept away from neutral light greys so shirts read as wit. */
  { name: 'creme', r: 238, g: 220, b: 185 },
  { name: 'grijs', r: 140, g: 140, b: 140 },
  { name: 'zilver', r: 192, g: 192, b: 192 },
  { name: 'rood', r: 190, g: 40, b: 40 },
  { name: 'bordeaux', r: 120, g: 20, b: 40 },
  { name: 'roze', r: 230, g: 140, b: 170 },
  { name: 'oranje', r: 230, g: 120, b: 40 },
  { name: 'geel', r: 230, g: 200, b: 50 },
  { name: 'groen', r: 50, g: 140, b: 60 },
  { name: 'blauw', r: 50, g: 90, b: 180 },
  { name: 'donkerblauw', r: 25, g: 40, b: 90 },
  { name: 'paars', r: 110, g: 50, b: 150 },
  { name: 'bruin', r: 110, g: 70, b: 40 },
  { name: 'beige', r: 210, g: 190, b: 155 },
  { name: 'camel', r: 180, g: 140, b: 90 },
  { name: 'goud', r: 200, g: 165, b: 60 },
  { name: 'khaki', r: 160, g: 150, b: 100 },
  { name: 'turquoise', r: 60, g: 190, b: 190 },
  { name: 'petrol', r: 30, g: 110, b: 120 },
];

function distanceSquared(a: Rgb, b: ColorAnchor): number {
  const dr = a.r - b.r;
  const dg = a.g - b.g;
  const db = a.b - b.b;
  return dr * dr + dg * dg + db * db;
}

function chroma(rgb: Rgb): number {
  return Math.max(rgb.r, rgb.g, rgb.b) - Math.min(rgb.r, rgb.g, rgb.b);
}

function luminance(rgb: Rgb): number {
  return 0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b;
}

/** Nearest named colour for an RGB triple in 0–255. */
export function nearestColorName(rgb: Rgb): string {
  // Bright, nearly neutral samples are white clothing under shop light — not crème.
  if (luminance(rgb) >= 200 && chroma(rgb) <= 28) {
    return 'wit';
  }

  let best = ANCHORS[0];
  let bestDistance = Number.POSITIVE_INFINITY;
  for (const anchor of ANCHORS) {
    const distance = distanceSquared(rgb, anchor);
    if (distance < bestDistance) {
      best = anchor;
      bestDistance = distance;
    }
  }
  return best?.name ?? 'grijs';
}

/**
 * Average RGB of the centre crop of a tightly packed RGBA buffer (row-major).
 * `inset` is the fraction cropped from each edge (0.25 → middle 50%).
 */
export function averageRgbFromRgba(
  data: Uint8Array | Uint8ClampedArray,
  width: number,
  height: number,
  inset = 0.25,
): Rgb | null {
  if (width < 1 || height < 1 || data.length < width * height * 4) {
    return null;
  }

  const x0 = Math.floor(width * inset);
  const y0 = Math.floor(height * inset);
  const x1 = Math.ceil(width * (1 - inset));
  const y1 = Math.ceil(height * (1 - inset));
  if (x1 <= x0 || y1 <= y0) {
    return null;
  }

  let r = 0;
  let g = 0;
  let b = 0;
  let count = 0;

  for (let y = y0; y < y1; y += 1) {
    for (let x = x0; x < x1; x += 1) {
      const i = (y * width + x) * 4;
      const red = data[i];
      const green = data[i + 1];
      const blue = data[i + 2];
      if (red === undefined || green === undefined || blue === undefined) {
        continue;
      }
      r += red;
      g += green;
      b += blue;
      count += 1;
    }
  }

  if (count === 0) {
    return null;
  }

  return {
    r: Math.round(r / count),
    g: Math.round(g / count),
    b: Math.round(b / count),
  };
}
