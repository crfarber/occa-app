import { describe, expect, it } from 'vitest';
import { resolveSelectedStoreId } from './resolve-selected-store';

describe('resolveSelectedStoreId', () => {
  const stores = [{ id: 'cloud-a' }, { id: 'cloud-b' }];

  it('keeps the current id when it is still one of the stores', () => {
    expect(resolveSelectedStoreId('cloud-b', stores)).toBe('cloud-b');
  });

  it('picks the first store when nothing is selected yet', () => {
    expect(resolveSelectedStoreId(null, stores)).toBe('cloud-a');
  });

  it('replaces a stale id that is not in the list (e.g. local Docker leftover)', () => {
    expect(resolveSelectedStoreId('00000000-0000-4000-8000-00000000a002', stores)).toBe(
      'cloud-a',
    );
  });

  it('returns null when the person has no stores', () => {
    expect(resolveSelectedStoreId('cloud-a', [])).toBeNull();
    expect(resolveSelectedStoreId(null, [])).toBeNull();
  });
});
