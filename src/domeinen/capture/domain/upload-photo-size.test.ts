import { describe, expect, it } from 'vitest';
import { UPLOAD_PHOTO_MAX_EDGE, fitInsideMaxEdge } from './upload-photo-size';

describe('fitInsideMaxEdge', () => {
  it('returns null when the long edge is already within the limit', () => {
    expect(fitInsideMaxEdge({ width: 1200, height: 900 })).toBeNull();
    expect(fitInsideMaxEdge({ width: UPLOAD_PHOTO_MAX_EDGE, height: 800 })).toBeNull();
  });

  it('scales a tall phone photo so the long edge becomes the max', () => {
    expect(fitInsideMaxEdge({ width: 3024, height: 4032 })).toEqual({
      width: 1155,
      height: UPLOAD_PHOTO_MAX_EDGE,
    });
  });

  it('scales a wide photo the same way', () => {
    expect(fitInsideMaxEdge({ width: 4000, height: 2000 })).toEqual({
      width: UPLOAD_PHOTO_MAX_EDGE,
      height: 770,
    });
  });

  it('accepts a stricter max edge', () => {
    expect(fitInsideMaxEdge({ width: 2000, height: 1000 }, 1000)).toEqual({
      width: 1000,
      height: 500,
    });
  });

  it('ignores empty or broken sizes', () => {
    expect(fitInsideMaxEdge({ width: 0, height: 1000 })).toBeNull();
    expect(fitInsideMaxEdge({ width: 1000, height: -1 })).toBeNull();
  });
});
