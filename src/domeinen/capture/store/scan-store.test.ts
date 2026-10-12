import { describe, expect, it } from 'vitest';
import { createFakeClock } from '@/test/fakes';
import type { InterpretLabelsResult } from '../domain/interpret-labels';
import { createScanStore } from './scan-store';

const shirtResult: InterpretLabelsResult = {
  category: { kind: 'known', category: 'top', score: 0.8 },
  colors: [],
  pattern: { kind: 'unknown' },
  subtype: null,
  labels: [{ text: 'Shirt', confidence: 0.8 }],
  uncertainFields: ['colors', 'pattern', 'subtype'],
};

const shirt = {
  photos: [{ uri: 'file:///shirt.jpg', role: 'overview' as const }],
  result: shirtResult,
};

describe('scan store', () => {
  it('keeps the latest scan first and stamps it with the clock', () => {
    const clock = createFakeClock(1_000);
    const scans = createScanStore(clock);

    scans.record(shirt);
    clock.advance(5_000);
    scans.record({
      ...shirt,
      photos: [{ uri: 'file:///shirt-2.jpg', role: 'overview' }],
    });

    const items = scans.store.getState().items;
    expect(items.map((item) => item.photos[0]?.uri)).toEqual([
      'file:///shirt-2.jpg',
      'file:///shirt.jpg',
    ]);
    expect(items[0]).toMatchObject({ scannedAt: 6_000 });
    expect(items[0]?.id).not.toBe(items[1]?.id);
  });

  it('stores multiple photos on one scan', () => {
    const scans = createScanStore(createFakeClock());

    scans.record({
      ...shirt,
      photos: [
        { uri: 'file:///shirt.jpg', role: 'overview' },
        { uri: 'file:///label.jpg', role: 'label' },
      ],
    });

    expect(scans.store.getState().items[0]?.photos).toEqual([
      { uri: 'file:///shirt.jpg', role: 'overview' },
      { uri: 'file:///label.jpg', role: 'label' },
    ]);
  });

  it('gives two scans at the same moment different ids', () => {
    const scans = createScanStore(createFakeClock(1_000));

    scans.record(shirt);
    scans.record(shirt);

    const [first, second] = scans.store.getState().items;
    expect(first?.id).not.toBe(second?.id);
  });

  it('starts a scan with an empty product listing', () => {
    const scans = createScanStore(createFakeClock());

    scans.record(shirt);

    expect(scans.store.getState().items[0]?.listing).toEqual({
      brand: '',
      price: '',
      description: '',
      category: '',
      subcategory: '',
      color: '',
      audience: '',
      size: '',
      shopSpot: '',
      number: '',
    });
  });

  it('seeds the listing when the caller passes recognised fields', () => {
    const scans = createScanStore(createFakeClock());

    scans.record({
      ...shirt,
      listing: { category: 'top', color: 'wit', subcategory: 'blouse' },
    });

    expect(scans.store.getState().items[0]?.listing).toMatchObject({
      category: 'top',
      color: 'wit',
      subcategory: 'blouse',
      brand: '',
    });
  });

  it('updates the listing of that scan only', () => {
    const scans = createScanStore(createFakeClock());
    scans.record(shirt);
    scans.record({
      ...shirt,
      photos: [{ uri: 'file:///other.jpg', role: 'overview' }],
    });
    const target = scans.store.getState().items[1];

    scans.updateListing(target?.id ?? '', { size: 'XL', color: 'beige' });

    const items = scans.store.getState().items;
    expect(items[1]?.listing.size).toBe('XL');
    expect(items[1]?.listing.color).toBe('beige');
    expect(items[0]?.listing.size).toBe('');
  });

  it('leaves the list unchanged when the scan is unknown', () => {
    const scans = createScanStore(createFakeClock());
    scans.record(shirt);
    const before = scans.store.getState().items;

    scans.updateListing('missing', { size: 'XL' });

    expect(scans.store.getState().items).toBe(before);
  });

  it('forgets every scan when cleared', () => {
    const scans = createScanStore(createFakeClock());
    scans.record(shirt);

    scans.clear();

    expect(scans.store.getState().items).toEqual([]);
  });
});
