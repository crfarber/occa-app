import { describe, expect, it } from 'vitest';
import {
  addCapturePhoto,
  canSubmitCaptureDraft,
  emptyCaptureDraft,
  setCaptureLabel,
} from './capture-draft';

describe('capture draft', () => {
  it('keeps up to three clothing photos before submitting', () => {
    let draft = emptyCaptureDraft();
    for (let index = 0; index < 4; index += 1) {
      draft = addCapturePhoto(draft, { uri: `photo-${index}`, role: 'overview' });
    }

    expect(draft.photos.map((photo) => photo.uri)).toEqual(['photo-0', 'photo-1', 'photo-2']);
  });

  it('stores only the latest recognized label text and photo', () => {
    const first = setCaptureLabel(emptyCaptureDraft(), 'label-1', 'ACNE STUDIOS');
    const updated = setCaptureLabel(first, 'label-2', '100% COTTON');

    expect(updated.photos).toEqual([{ uri: 'label-2', role: 'label' }]);
    expect(updated.labelText).toBe('100% COTTON');
  });

  it('allows submitting when clothing and label text are both present', () => {
    const withPhoto = addCapturePhoto(emptyCaptureDraft(), {
      uri: 'clothing-1',
      role: 'overview',
    });
    expect(canSubmitCaptureDraft(withPhoto)).toBe(false);

    const complete = setCaptureLabel(withPhoto, 'label-1', 'M / 100% COTTON');
    expect(canSubmitCaptureDraft(complete)).toBe(true);
  });
});
