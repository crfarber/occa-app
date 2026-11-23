import type { ScanPhoto } from './scan-photos';

export const MAX_CLOTHING_PHOTOS = 3;

export type CaptureDraft = {
  photos: ScanPhoto[];
  labelText: string | null;
};

export function emptyCaptureDraft(): CaptureDraft {
  return { photos: [], labelText: null };
}

export function addCapturePhoto(draft: CaptureDraft, photo: ScanPhoto): CaptureDraft {
  if (photo.role === 'label') {
    return { ...draft, photos: [...draft.photos.filter((item) => item.role !== 'label'), photo] };
  }
  const clothingCount = draft.photos.filter((item) => item.role === 'overview').length;
  if (clothingCount >= MAX_CLOTHING_PHOTOS) {
    return draft;
  }
  return { ...draft, photos: [...draft.photos, photo] };
}

export function setCaptureLabel(draft: CaptureDraft, uri: string, text: string): CaptureDraft {
  return {
    ...addCapturePhoto(draft, { uri, role: 'label' }),
    labelText: text.trim() || null,
  };
}

export function canSubmitCaptureDraft(draft: CaptureDraft): boolean {
  return (
    draft.photos.some((photo) => photo.role === 'overview') &&
    draft.labelText !== null &&
    draft.labelText.trim().length > 0
  );
}
