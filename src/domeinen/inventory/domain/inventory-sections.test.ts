import { describe, expect, it } from 'vitest';
import { groupInventoryByCategory } from './inventory-sections';

describe('groupInventoryByCategory', () => {
  it('groups by category and keeps first-seen order', () => {
    const sections = groupInventoryByCategory(
      [
        { id: '1', category: 'trui' },
        { id: '2', category: 'jas' },
        { id: '3', category: 'trui' },
      ],
      'Overig',
    );
    expect(sections.map((section) => section.title)).toEqual(['trui', 'jas']);
    expect(sections[0]?.data.map((item) => item.id)).toEqual(['1', '3']);
  });

  it('puts uncategorised items last', () => {
    const sections = groupInventoryByCategory(
      [
        { id: '1', category: null },
        { id: '2', category: 'jas' },
        { id: '3', category: '  ' },
      ],
      'Overig',
    );
    expect(sections.map((section) => section.title)).toEqual(['jas', 'Overig']);
    expect(sections[1]?.data.map((item) => item.id)).toEqual(['1', '3']);
  });
});
