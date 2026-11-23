/**
 * Target size for photos that leave the phone (web only, never print).
 * Matches partner `resizeForAnalysis` DEFAULT_MAX_EDGE / DEFAULT_JPEG_QUALITY
 * so the multipart body is already what the shop-API stores.
 */

/** Longest side kept after crop, in pixels. */
export const UPLOAD_PHOTO_MAX_EDGE = 1540;

/**
 * JPEG quality for expo-image-manipulator (0–1).
 * Same intent as partner quality 82.
 */
export const UPLOAD_PHOTO_JPEG_QUALITY = 0.82;

export type PixelSize = { width: number; height: number };

/**
 * Fit-inside scale so the long edge is at most `maxEdge`.
 * Returns null when the photo is already small enough (no enlarge).
 */
export function fitInsideMaxEdge(
  size: PixelSize,
  maxEdge: number = UPLOAD_PHOTO_MAX_EDGE,
): PixelSize | null {
  if (size.width < 1 || size.height < 1 || maxEdge < 1) {
    return null;
  }
  const edge = Math.max(size.width, size.height);
  if (edge <= maxEdge) {
    return null;
  }
  const scale = maxEdge / edge;
  return {
    width: Math.max(1, Math.round(size.width * scale)),
    height: Math.max(1, Math.round(size.height * scale)),
  };
}
