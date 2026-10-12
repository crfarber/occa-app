import { describe, expect, it } from 'vitest';
import { averageRgbFromRgba, nearestColorName } from './color-from-rgb';

describe('nearestColorName', () => {
  it('maps near-white samples to wit', () => {
    expect(nearestColorName({ r: 250, g: 248, b: 245 })).toBe('wit');
    expect(nearestColorName({ r: 230, g: 230, b: 230 })).toBe('wit');
  });

  it('maps warm off-white samples to creme', () => {
    expect(nearestColorName({ r: 240, g: 220, b: 180 })).toBe('creme');
  });

  it('maps dark samples to zwart', () => {
    expect(nearestColorName({ r: 10, g: 10, b: 12 })).toBe('zwart');
  });

  it('maps a strong red to rood', () => {
    expect(nearestColorName({ r: 200, g: 30, b: 35 })).toBe('rood');
  });

  it('maps navy-ish samples to donkerblauw', () => {
    expect(nearestColorName({ r: 20, g: 35, b: 95 })).toBe('donkerblauw');
  });
});

describe('averageRgbFromRgba', () => {
  it('averages the centre pixels of a solid buffer', () => {
    const width = 4;
    const height = 4;
    const data = new Uint8Array(width * height * 4);
    for (let i = 0; i < width * height; i += 1) {
      const o = i * 4;
      data[o] = 240;
      data[o + 1] = 240;
      data[o + 2] = 240;
      data[o + 3] = 255;
    }

    expect(averageRgbFromRgba(data, width, height, 0.25)).toEqual({
      r: 240,
      g: 240,
      b: 240,
    });
  });

  it('returns null for an empty buffer', () => {
    expect(averageRgbFromRgba(new Uint8Array(0), 0, 0)).toBeNull();
  });
});
