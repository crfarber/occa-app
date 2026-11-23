import { describe, expect, it } from 'vitest';
import { emptyListing } from '@/domeinen/capture';
import type { InterpretLabelsResult } from '@/domeinen/capture';
import {
  fieldsFromListing,
  payloadFromScan,
  photosFromScan,
  suggestionsFromResult,
} from './map-scan';

const result: InterpretLabelsResult = {
  category: { kind: 'known', category: 'trui_vest', score: 0.9 },
  colors: ['rood'],
  subtype: 'sweater',
  pattern: { kind: 'known', pattern: 'gestreept', score: 0.8 },
  labels: [],
  uncertainFields: [],
};

describe('fieldsFromListing', () => {
  it('maps the phone category to the platform vocabulary and skips blanks', () => {
    expect(
      fieldsFromListing({
        ...emptyListing(),
        category: 'trui_vest',
        color: ' rood ',
        brand: 'Armedangels',
        price: '12,50',
        shopSpot: 'A1',
      }),
    ).toEqual({
      category: 'trui',
      colour: 'rood',
      brand: 'Armedangels',
      priceCents: 1250,
      location: 'A1',
    });
  });
});

describe('suggestionsFromResult', () => {
  it('keeps a guess only when the volunteer left that field empty', () => {
    expect(suggestionsFromResult(result, emptyListing())).toEqual({
      category: 'trui',
      colour: 'rood',
    });
    expect(
      suggestionsFromResult(result, { ...emptyListing(), category: 'jas', color: 'blauw' }),
    ).toEqual({});
  });
});

describe('photosFromScan', () => {
  it('makes the first overview the main photo and labels stay labels', () => {
    expect(
      photosFromScan([
        { uri: 'file://a.jpg', role: 'overview' },
        { uri: 'file://b.jpg', role: 'label' },
        { uri: 'file://c.jpg', role: 'overview' },
      ]),
    ).toEqual([
      { photoKey: 'photo-main-1', role: 'main', uri: 'file://a.jpg' },
      { photoKey: 'photo-label-1', role: 'label', uri: 'file://b.jpg' },
      { photoKey: 'photo-extra-2', role: 'extra', uri: 'file://c.jpg' },
    ]);
  });
});

describe('payloadFromScan', () => {
  it('bundles fields, suggestions and photos under a client key', () => {
    const payload = payloadFromScan({
      clientKey: 'scan-1000-1',
      photos: [{ uri: 'file://a.jpg', role: 'overview' }],
      result,
      listing: { ...emptyListing(), brand: 'WE' },
    });
    expect(payload.clientKey).toBe('scan-1000-1');
    expect(payload.fields.brand).toBe('WE');
    expect(payload.suggestions.category).toBe('trui');
    expect(payload.photos).toHaveLength(1);
  });
});
