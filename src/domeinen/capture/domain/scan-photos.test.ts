import { describe, expect, it } from 'vitest';
import { canAddPhoto, MAX_SCAN_PHOTOS, primaryPhotoUri, type ScanPhoto } from './scan-photos';

function photo(uri: string, role: ScanPhoto['role']): ScanPhoto {
  return { uri, role };
}

describe('canAddPhoto', () => {
  it('allows adding until the max is reached', () => {
    expect(canAddPhoto([])).toBe(true);
    expect(canAddPhoto([photo('a', 'overview')])).toBe(true);
    expect(canAddPhoto([photo('a', 'overview'), photo('b', 'label'), photo('c', 'overview')])).toBe(
      false,
    );
    expect(MAX_SCAN_PHOTOS).toBe(3);
  });
});

describe('primaryPhotoUri', () => {
  it('prefers the first overview photo', () => {
    expect(
      primaryPhotoUri([
        photo('file:///label.jpg', 'label'),
        photo('file:///shirt.jpg', 'overview'),
        photo('file:///shirt-2.jpg', 'overview'),
      ]),
    ).toBe('file:///shirt.jpg');
  });

  it('falls back to the first photo when there is no overview', () => {
    expect(primaryPhotoUri([photo('file:///label.jpg', 'label')])).toBe('file:///label.jpg');
  });

  it('returns null for an empty list', () => {
    expect(primaryPhotoUri([])).toBeNull();
  });
});
