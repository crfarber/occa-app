import { describe, expect, it } from 'vitest';
import { interpretLabels } from './interpret-labels';
import { mergeInterpretResults } from './merge-interpret-results';

describe('mergeInterpretResults', () => {
  it('returns a fully uncertain draft when there are no results', () => {
    const merged = mergeInterpretResults([]);
    expect(merged).toEqual(interpretLabels([]));
  });

  it('returns the only result unchanged', () => {
    const only = interpretLabels([{ text: 'T-Shirt', confidence: 0.7 }]);
    expect(mergeInterpretResults([only])).toEqual(only);
  });

  it('picks the stronger category across photos', () => {
    const shirt = interpretLabels([{ text: 'T-Shirt', confidence: 0.4 }]);
    const pants = interpretLabels([{ text: 'Pants', confidence: 0.85 }]);
    const merged = mergeInterpretResults([shirt, pants]);
    expect(merged.category).toEqual({ kind: 'known', category: 'broek', score: 0.85 });
    expect(merged.subtype).toBe('pantalon');
  });

  it('keeps the highest confidence when the same label appears twice', () => {
    const soft = interpretLabels([{ text: 'Hoodie', confidence: 0.3 }]);
    const strong = interpretLabels([{ text: 'Hoodie', confidence: 0.8 }]);
    const merged = mergeInterpretResults([soft, strong]);
    expect(merged.labels).toEqual([{ text: 'Hoodie', confidence: 0.8 }]);
    expect(merged.category).toEqual({ kind: 'known', category: 'trui_vest', score: 0.8 });
  });

  it('unions colour labels from different photos', () => {
    const black = interpretLabels([
      { text: 'T-Shirt', confidence: 0.7 },
      { text: 'Black', confidence: 0.9 },
    ]);
    const red = interpretLabels([
      { text: 'Shirt', confidence: 0.6 },
      { text: 'Red', confidence: 0.8 },
    ]);
    const merged = mergeInterpretResults([black, red]);
    expect(merged.colors).toEqual(['zwart', 'rood']);
  });
});
