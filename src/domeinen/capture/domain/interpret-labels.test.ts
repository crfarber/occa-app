import { describe, expect, it } from 'vitest';
import { interpretLabels } from './interpret-labels';

describe('interpretLabels', () => {
  it('maps a shirt label to top', () => {
    const result = interpretLabels([
      { text: 'Clothing', confidence: 0.92 },
      { text: 'Shirt', confidence: 0.71 },
    ]);

    expect(result.category).toEqual({
      kind: 'known',
      category: 'top',
      score: 0.71,
    });
    expect(result.labels).toHaveLength(2);
  });

  it('maps jeans to broek and sets subtype', () => {
    const result = interpretLabels([{ text: 'Jeans', confidence: 0.88 }]);
    expect(result.category).toEqual({
      kind: 'known',
      category: 'broek',
      score: 0.88,
    });
    expect(result.subtype).toBe('jeans');
  });

  it('maps jacket to jas', () => {
    const result = interpretLabels([{ text: 'Jacket', confidence: 0.8 }]);
    expect(result.category).toEqual({
      kind: 'known',
      category: 'jas',
      score: 0.8,
    });
  });

  it('maps t-shirt variants to top and subtype', () => {
    for (const text of ['T-shirt', 'T shirt', 'Tee', 'Polo shirt']) {
      const result = interpretLabels([{ text, confidence: 0.7 }]);
      expect(result.category).toMatchObject({
        kind: 'known',
        category: 'top',
      });
    }
    expect(interpretLabels([{ text: 'T-shirt', confidence: 0.7 }]).subtype).toBe('t-shirt');
  });

  it('maps custom TFLite category labels to product fields', () => {
    expect(interpretLabels([{ text: 'T-Shirt', confidence: 0.9 }])).toMatchObject({
      category: { kind: 'known', category: 'top', score: 0.9 },
      subtype: 't-shirt',
    });
    expect(interpretLabels([{ text: 'Longsleeve', confidence: 0.8 }])).toMatchObject({
      category: { kind: 'known', category: 'top' },
      subtype: 'longsleeve',
    });
    expect(interpretLabels([{ text: 'Outwear', confidence: 0.75 }])).toMatchObject({
      category: { kind: 'known', category: 'jas' },
      subtype: 'jas',
    });
    expect(interpretLabels([{ text: 'Undershirt', confidence: 0.7 }])).toMatchObject({
      category: { kind: 'known', category: 'top' },
      subtype: 'hemd',
    });
    expect(interpretLabels([{ text: 'Shoes', confidence: 0.85 }])).toMatchObject({
      category: { kind: 'known', category: 'schoenen' },
      subtype: 'schoenen',
    });
    expect(interpretLabels([{ text: 'Hat', confidence: 0.9 }]).category).toEqual({
      kind: 'unknown',
    });
  });

  it('prefers top over jacket when both labels are present', () => {
    const result = interpretLabels([
      { text: 'Jacket', confidence: 0.9 },
      { text: 'T-shirt', confidence: 0.62 },
      { text: 'Clothing', confidence: 0.95 },
    ]);
    expect(result.category).toEqual({
      kind: 'known',
      category: 'top',
      score: 0.62,
    });
    expect(result.subtype).toBe('t-shirt');
  });

  it('maps footwear to schoenen', () => {
    const result = interpretLabels([{ text: 'Footwear', confidence: 0.9 }]);
    expect(result.category).toEqual({
      kind: 'known',
      category: 'schoenen',
      score: 0.9,
    });
  });

  it('maps handbag to tas', () => {
    const result = interpretLabels([{ text: 'Handbag', confidence: 0.77 }]);
    expect(result.category).toEqual({
      kind: 'known',
      category: 'tas',
      score: 0.77,
    });
  });

  it('extracts Dutch colors from English ML Kit labels', () => {
    const result = interpretLabels([
      { text: 'Shirt', confidence: 0.8 },
      { text: 'Red', confidence: 0.72 },
      { text: 'White', confidence: 0.55 },
    ]);

    expect(result.colors).toEqual(['rood', 'wit']);
    expect(result.uncertainFields).not.toContain('colors');
  });

  it('keeps at most three unique colors, highest score first', () => {
    const result = interpretLabels([
      { text: 'Blue', confidence: 0.5 },
      { text: 'Red', confidence: 0.9 },
      { text: 'Green', confidence: 0.7 },
      { text: 'Yellow', confidence: 0.6 },
      { text: 'Blue', confidence: 0.95 },
    ]);

    expect(result.colors).toEqual(['blauw', 'rood', 'groen']);
  });

  it('ignores a color below the confidence threshold', () => {
    const result = interpretLabels([
      { text: 'Shirt', confidence: 0.8 },
      { text: 'Red', confidence: 0.39 },
    ]);
    expect(result.colors).toEqual([]);
    expect(result.uncertainFields).toContain('colors');
  });

  it('maps striped to gestreept', () => {
    const result = interpretLabels([
      { text: 'Shirt', confidence: 0.8 },
      { text: 'Striped', confidence: 0.65 },
    ]);
    expect(result.pattern).toEqual({
      kind: 'known',
      pattern: 'gestreept',
      score: 0.65,
    });
  });

  it('stays unknown for category when only Clothing is present', () => {
    const result = interpretLabels([{ text: 'Clothing', confidence: 0.92 }]);
    expect(result.category).toEqual({ kind: 'unknown' });
    expect(result.colors).toEqual([]);
    expect(result.pattern).toEqual({ kind: 'unknown' });
    expect(result.subtype).toBeNull();
    expect(result.uncertainFields).toEqual(['category', 'colors', 'pattern', 'subtype']);
  });

  it('stays unknown when Fashion and Person are the only labels', () => {
    const result = interpretLabels([
      { text: 'Fashion', confidence: 0.85 },
      { text: 'Person', confidence: 0.8 },
    ]);
    expect(result.category).toEqual({ kind: 'unknown' });
  });

  it('ignores a mapped category label below the confidence threshold', () => {
    const result = interpretLabels([{ text: 'Shirt', confidence: 0.19 }]);
    expect(result.category).toEqual({ kind: 'unknown' });
  });

  it('accepts a custom-model category score above the soft int8 threshold', () => {
    const result = interpretLabels([{ text: 'T-Shirt', confidence: 0.22 }]);
    expect(result.category).toEqual({ kind: 'known', category: 'top', score: 0.22 });
    expect(result.subtype).toBe('t-shirt');
  });

  it('ignores Hat as subtype when the category is a top', () => {
    const result = interpretLabels([
      { text: 'T-Shirt', confidence: 0.55 },
      { text: 'Hat', confidence: 0.9 },
    ]);
    expect(result.category).toEqual({ kind: 'known', category: 'top', score: 0.55 });
    expect(result.subtype).toBe('t-shirt');
  });

  it('picks the highest mapped score when several categories match', () => {
    const result = interpretLabels([
      { text: 'Shirt', confidence: 0.6 },
      { text: 'Jeans', confidence: 0.81 },
      { text: 'Shoe', confidence: 0.55 },
    ]);
    expect(result.category).toEqual({
      kind: 'known',
      category: 'broek',
      score: 0.81,
    });
  });

  it('matches labels case-insensitively', () => {
    const result = interpretLabels([
      { text: 'T-SHIRT', confidence: 0.65 },
      { text: 'NAVY BLUE', confidence: 0.7 },
    ]);
    expect(result.category).toEqual({
      kind: 'known',
      category: 'top',
      score: 0.65,
    });
    expect(result.colors).toEqual(['donkerblauw']);
  });

  it('returns an empty label list as fully uncertain', () => {
    const result = interpretLabels([]);
    expect(result.category).toEqual({ kind: 'unknown' });
    expect(result.labels).toEqual([]);
    expect(result.uncertainFields).toEqual(['category', 'colors', 'pattern', 'subtype']);
  });
});
