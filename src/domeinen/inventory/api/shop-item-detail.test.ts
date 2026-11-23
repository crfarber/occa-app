import { describe, expect, it } from 'vitest';
import { shopItemDetailSchema } from './shop-item-detail';

const base = {
  id: 'item-1',
  status: 'concept',
  number: 3,
  source: 'handmatig',
  category: 'jas',
  doelgroep: 'dames',
  size: 'M',
  colour: 'rood',
  brand: null,
  description: null,
  priceCents: 1200,
  location: 'A1',
  sport: false,
  typeKeywords: [],
  photos: { main: null, extra: [], label: null },
  createdAt: '2026-11-20T10:00:00.000Z',
  editable: true,
  priceLocked: false,
};

describe('shopItemDetailSchema', () => {
  it('accepts a detail without review photo fields (older server)', () => {
    const parsed = shopItemDetailSchema.parse(base);
    expect(parsed.photos.original).toBeUndefined();
    expect(parsed.photoStatus).toBeUndefined();
  });

  it('keeps original, cut-out, background and photoStatus when present', () => {
    const parsed = shopItemDetailSchema.parse({
      ...base,
      photoStatus: 'klaar',
      photos: {
        main: 'https://example.test/drawn.jpg',
        extra: [],
        label: null,
        original: 'https://example.test/cam.jpg',
        cutout: 'https://example.test/cut.png',
        background: 'creme',
      },
    });
    expect(parsed.photos.original).toBe('https://example.test/cam.jpg');
    expect(parsed.photos.cutout).toBe('https://example.test/cut.png');
    expect(parsed.photos.background).toBe('creme');
    expect(parsed.photoStatus).toBe('klaar');
  });
});
