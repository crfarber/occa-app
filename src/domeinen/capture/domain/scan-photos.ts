/**
 * Photos attached to one scan. Overview shots feed the category model; label
 * shots are stored for the employee (and later OCR) without classification.
 */

export const PHOTO_ROLES = ['overview', 'label'] as const;
export type PhotoRole = (typeof PHOTO_ROLES)[number];

export const MAX_SCAN_PHOTOS = 3;

export type ScanPhoto = {
  uri: string;
  role: PhotoRole;
};

export function canAddPhoto(photos: readonly ScanPhoto[]): boolean {
  return photos.length < MAX_SCAN_PHOTOS;
}

/** Thumbnail / list image: first overview, otherwise the first photo. */
export function primaryPhotoUri(photos: readonly ScanPhoto[]): string | null {
  for (const photo of photos) {
    if (photo.role === 'overview') {
      return photo.uri;
    }
  }
  return photos[0]?.uri ?? null;
}
