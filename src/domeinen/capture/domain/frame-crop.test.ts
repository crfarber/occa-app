import { describe, expect, it } from 'vitest';
import {
  clampAlignTranslation,
  coverFittedImageRect,
  coverScaleForFrame,
  cropRectFromAlignTransform,
  frameRectInViewport,
  mapViewRectToImageCrop,
} from './frame-crop';

describe('frameRectInViewport', () => {
  it('keeps a 3:4 frame centred in the available band', () => {
    const frame = frameRectInViewport(
      { width: 400, height: 800 },
      { topReserve: 100, bottomReserve: 100, horizontalInsetFraction: 0.1 },
    );
    expect(frame.width / frame.height).toBeCloseTo(3 / 4, 5);
    expect(frame.x + frame.width / 2).toBeCloseTo(200, 5);
    expect(frame.y).toBeGreaterThanOrEqual(100);
    expect(frame.y + frame.height).toBeLessThanOrEqual(700);
  });
});

describe('mapViewRectToImageCrop', () => {
  it('maps the centred cover view onto the matching image pixels', () => {
    const view = { width: 100, height: 200 };
    const image = { width: 1000, height: 2000 };
    const fitted = coverFittedImageRect(view, image);
    expect(fitted).toEqual({ x: 0, y: 0, width: 100, height: 200 });

    const crop = mapViewRectToImageCrop({ x: 10, y: 20, width: 80, height: 160 }, view, image);
    expect(crop).toEqual({
      originX: 100,
      originY: 200,
      width: 800,
      height: 1600,
    });
  });

  it('accounts for letterboxed cover overflow on a wide image', () => {
    const view = { width: 100, height: 100 };
    const image = { width: 400, height: 200 };
    // cover scale = max(100/400, 100/200) = 0.5 → displayed 200×100, x = -50
    const crop = mapViewRectToImageCrop({ x: 0, y: 0, width: 100, height: 100 }, view, image);
    expect(crop).toEqual({
      originX: 100,
      originY: 0,
      width: 200,
      height: 200,
    });
  });
});

describe('cropRectFromAlignTransform', () => {
  it('returns the full image when it already matches the frame aspect at scale 1', () => {
    const crop = cropRectFromAlignTransform({
      frame: { width: 300, height: 400 },
      image: { width: 300, height: 400 },
      userScale: 1,
      translateX: 0,
      translateY: 0,
    });
    expect(crop).toEqual({
      originX: 0,
      originY: 0,
      width: 300,
      height: 400,
    });
  });

  it('zooms into the centre when the user scale increases', () => {
    const crop = cropRectFromAlignTransform({
      frame: { width: 300, height: 400 },
      image: { width: 300, height: 400 },
      userScale: 2,
      translateX: 0,
      translateY: 0,
    });
    expect(crop).toEqual({
      originX: 75,
      originY: 100,
      width: 150,
      height: 200,
    });
  });

  it('clamps pan so the frame stays covered', () => {
    const clamped = clampAlignTranslation({
      frame: { width: 100, height: 100 },
      image: { width: 100, height: 100 },
      userScale: 1,
      translateX: 999,
      translateY: -999,
    });
    expect(clamped).toEqual({ translateX: 0, translateY: 0 });
    expect(coverScaleForFrame({ width: 100, height: 100 }, { width: 50, height: 50 })).toBe(2);
  });
});
