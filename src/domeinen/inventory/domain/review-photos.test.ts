import { describe, expect, it } from 'vitest';
import { photoStillProcessing, reviewPhotosOf } from './review-photos';

describe('reviewPhotosOf', () => {
  it('is empty when the main photo has no background yet', () => {
    expect(reviewPhotosOf({ main: 'https://a.test/m.jpg' })).toEqual([]);
  });

  it('lists background, original and cut-out when the worker finished', () => {
    expect(
      reviewPhotosOf({
        main: 'https://a.test/drawn.jpg',
        original: 'https://a.test/cam.jpg',
        cutout: 'https://a.test/cut.png',
        background: 'creme',
      }),
    ).toEqual([
      { kind: 'background', uri: 'https://a.test/drawn.jpg' },
      { kind: 'original', uri: 'https://a.test/cam.jpg' },
      { kind: 'cutout', uri: 'https://a.test/cut.png' },
    ]);
  });

  it('skips missing sides', () => {
    expect(
      reviewPhotosOf({
        main: 'https://a.test/drawn.jpg',
        original: null,
        cutout: 'https://a.test/cut.png',
        background: 'antraciet',
      }),
    ).toEqual([
      { kind: 'background', uri: 'https://a.test/drawn.jpg' },
      { kind: 'cutout', uri: 'https://a.test/cut.png' },
    ]);
  });
});

describe('photoStillProcessing', () => {
  it('is true only while waiting or running', () => {
    expect(photoStillProcessing('wachtend')).toBe(true);
    expect(photoStillProcessing('bezig')).toBe(true);
    expect(photoStillProcessing('klaar')).toBe(false);
    expect(photoStillProcessing(null)).toBe(false);
  });
});
