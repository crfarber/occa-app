import { describe, expect, it } from 'vitest';
import { createInMemoryStore } from '@/test/fakes';
import type { OutboxEntry } from '../domain/outbox';
import { createOutboxRepository, OUTBOX_STORAGE_KEY } from './outbox-repository';

const sample: OutboxEntry = {
  id: 'e1',
  clientKey: 'scan-1aaaaaaa',
  storeId: 'store-1',
  status: 'pending',
  attempts: 0,
  itemId: null,
  fields: { brand: 'WE' },
  suggestions: {},
  photos: [{ photoKey: 'photo-main-1', role: 'main', uri: 'file://a.jpg', uploaded: false }],
  createdAt: 1,
  nextAttemptAt: 0,
  lastError: null,
};

describe('createOutboxRepository', () => {
  it('round-trips entries and clears them', async () => {
    const store = createInMemoryStore();
    const repo = createOutboxRepository(store);
    await repo.save([sample]);
    expect(await repo.load()).toEqual([sample]);
    expect(store.dump()[OUTBOX_STORAGE_KEY]).toContain('scan-1aaaaaaa');
    await repo.clear();
    expect(await repo.load()).toEqual([]);
  });

  it('drops a corrupted value rather than crashing at start', async () => {
    const store = createInMemoryStore({ [OUTBOX_STORAGE_KEY]: '{not-json' });
    expect(await createOutboxRepository(store).load()).toEqual([]);
  });
});
