import { describe, expect, it } from 'vitest';
import {
  createInitialInventoryBrowseState,
  inventoryBrowseReducer,
  inventoryDraftApplied,
  inventoryDraftCategoryToggled,
  inventoryDraftCleared,
  inventoryDraftColourSelected,
  inventoryDraftSizeToggled,
  inventorySearchChanged,
  inventorySheetDismissed,
  inventorySheetOpened,
  type InventoryBrowseState,
} from './inventory-browse.action';

function editing(overrides?: Partial<InventoryBrowseState>): InventoryBrowseState {
  const base = createInitialInventoryBrowseState();
  const withApplied: InventoryBrowseState = {
    ...base,
    applied: { sizes: ['M'], colour: 'zwart', categories: ['trui'] },
    ...overrides,
  };
  return inventoryBrowseReducer(withApplied, inventorySheetOpened());
}

describe('inventoryBrowseReducer', () => {
  it('starts closed with empty search and filters', () => {
    expect(createInitialInventoryBrowseState()).toEqual({
      search: '',
      applied: { sizes: [], colour: null, categories: [] },
      sheet: { phase: 'closed' },
    });
  });

  it('copies applied into the draft when the sheet opens', () => {
    const state = editing();
    expect(state.sheet).toEqual({
      phase: 'editing',
      draft: { sizes: ['M'], colour: 'zwart', categories: ['trui'] },
    });
    expect(state.applied).toEqual({ sizes: ['M'], colour: 'zwart', categories: ['trui'] });
  });

  it('edits the draft without changing applied', () => {
    const opened = editing();
    const next = inventoryBrowseReducer(opened, inventoryDraftSizeToggled('L'));
    expect(next.sheet.phase === 'editing' && next.sheet.draft.sizes).toEqual(['M', 'L']);
    expect(next.applied.sizes).toEqual(['M']);
  });

  it('leaves draft actions unchanged while closed', () => {
    const closed = createInitialInventoryBrowseState();
    const next = inventoryBrowseReducer(closed, inventoryDraftSizeToggled('M'));
    expect(next).toBe(closed);
  });

  it('clears colour with null for Alle kleuren', () => {
    const next = inventoryBrowseReducer(editing(), inventoryDraftColourSelected(null));
    expect(next.sheet.phase === 'editing' && next.sheet.draft.colour).toBeNull();
  });

  it('clears the draft without closing or changing applied', () => {
    const next = inventoryBrowseReducer(editing(), inventoryDraftCleared());
    expect(next.sheet).toEqual({
      phase: 'editing',
      draft: { sizes: [], colour: null, categories: [] },
    });
    expect(next.applied).toEqual({ sizes: ['M'], colour: 'zwart', categories: ['trui'] });
  });

  it('applies the draft and closes the sheet', () => {
    let state = editing();
    state = inventoryBrowseReducer(state, inventoryDraftCategoryToggled('jas'));
    state = inventoryBrowseReducer(state, inventoryDraftApplied());
    expect(state.sheet).toEqual({ phase: 'closed' });
    expect(state.applied.categories).toEqual(['trui', 'jas']);
  });

  it('discards the draft on dismiss and keeps applied', () => {
    let state = editing();
    state = inventoryBrowseReducer(state, inventoryDraftSizeToggled('L'));
    state = inventoryBrowseReducer(state, inventorySheetDismissed());
    expect(state.sheet).toEqual({ phase: 'closed' });
    expect(state.applied.sizes).toEqual(['M']);
  });

  it('changes search without touching sheet or filters', () => {
    const opened = editing();
    const next = inventoryBrowseReducer(opened, inventorySearchChanged('jas'));
    expect(next.search).toBe('jas');
    expect(next.applied).toBe(opened.applied);
    expect(next.sheet).toEqual(opened.sheet);
  });
});
