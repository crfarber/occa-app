import { describe, expect, it } from 'vitest';
import { fieldReturnKeyType, resolveFieldSubmit } from './form-chain';

describe('fieldReturnKeyType', () => {
  it('uses next for every field except the last', () => {
    expect(fieldReturnKeyType({ index: 0, count: 2 })).toBe('next');
    expect(fieldReturnKeyType({ index: 1, count: 2 })).toBe('done');
  });

  it('uses the lastAction on the final field', () => {
    expect(fieldReturnKeyType({ index: 1, count: 2, lastAction: 'go' })).toBe('go');
  });

  it('keeps default on a multiline field so Enter inserts a newline', () => {
    expect(fieldReturnKeyType({ index: 0, count: 3, multiline: true })).toBe('default');
  });

  it('uses done when there is only one field', () => {
    expect(fieldReturnKeyType({ index: 0, count: 1 })).toBe('done');
  });
});

describe('resolveFieldSubmit', () => {
  it('focuses the next field when there is one after', () => {
    expect(resolveFieldSubmit({ index: 0, count: 2, multiline: false })).toBe('focus-next');
  });

  it('submits on the last single-line field', () => {
    expect(resolveFieldSubmit({ index: 1, count: 2, multiline: false })).toBe('submit');
  });

  it('does nothing on a multiline field', () => {
    expect(resolveFieldSubmit({ index: 0, count: 2, multiline: true })).toBe('none');
  });
});
