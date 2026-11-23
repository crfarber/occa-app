/**
 * Which photos to show for review after the concept worker (November 2026).
 * Pure: the screen only lays them out.
 */

export type ReviewPhotoKind = 'background' | 'original' | 'cutout';

export type ReviewPhoto = {
  kind: ReviewPhotoKind;
  uri: string;
};

export type ReviewPhotosInput = {
  main: string | null;
  original?: string | null;
  cutout?: string | null;
  background?: 'creme' | 'antraciet' | null;
};

/** Ordered tiles: on background, camera original, cut-out — only when present. */
export function reviewPhotosOf(photos: ReviewPhotosInput): ReviewPhoto[] {
  const rows: ReviewPhoto[] = [];
  if (photos.main !== null && photos.background != null) {
    rows.push({ kind: 'background', uri: photos.main });
  }
  const original = photos.original ?? null;
  if (original !== null) {
    rows.push({ kind: 'original', uri: original });
  }
  const cutout = photos.cutout ?? null;
  if (cutout !== null) {
    rows.push({ kind: 'cutout', uri: cutout });
  }
  return rows;
}

/** True while the worker is still working on the main photo. */
export function photoStillProcessing(status: string | null | undefined): boolean {
  return status === 'wachtend' || status === 'bezig';
}
