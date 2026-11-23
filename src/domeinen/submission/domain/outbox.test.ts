import { describe, expect, it } from 'vitest';
import {
  dueEntries,
  markFailed,
  markRetryable,
  markSending,
  nextAttemptAt,
  removeEntry,
  replaceEntry,
  type OutboxEntry,
} from './outbox';

const NOW = 1_000_000;

function entry(over: Partial<OutboxEntry> = {}): OutboxEntry {
  return {
    id: 'e1',
    clientKey: 'scan-1',
    storeId: 'store-1',
    status: 'pending',
    attempts: 0,
    itemId: null,
    fields: {},
    suggestions: {},
    photos: [],
    createdAt: NOW - 10,
    nextAttemptAt: 0,
    lastError: null,
    ...over,
  };
}

describe('nextAttemptAt', () => {
  it('backs off and then stays at two minutes', () => {
    expect(nextAttemptAt(1, NOW)).toBe(NOW + 5_000);
    expect(nextAttemptAt(2, NOW)).toBe(NOW + 15_000);
    expect(nextAttemptAt(3, NOW)).toBe(NOW + 45_000);
    expect(nextAttemptAt(4, NOW)).toBe(NOW + 120_000);
    expect(nextAttemptAt(9, NOW)).toBe(NOW + 120_000);
  });
});

describe('dueEntries', () => {
  it('takes pending and failed that are due, oldest first, and skips sending', () => {
    const older = entry({ id: 'old', createdAt: NOW - 100, nextAttemptAt: 0 });
    const newer = entry({ id: 'new', createdAt: NOW - 50, nextAttemptAt: 0 });
    const later = entry({ id: 'later', nextAttemptAt: NOW + 1 });
    const sending = entry({ id: 'busy', status: 'sending' });
    expect(dueEntries([newer, later, older, sending], NOW).map((e) => e.id)).toEqual([
      'old',
      'new',
    ]);
  });
});

describe('status updates', () => {
  it('counts an attempt when sending starts and schedules a retry after a temporary failure', () => {
    const sending = markSending(entry(), NOW);
    expect(sending).toMatchObject({ status: 'sending', attempts: 1 });
    const retry = markRetryable(sending, 'timeout', NOW);
    expect(retry.status).toBe('failed');
    expect(retry.nextAttemptAt).toBe(NOW + 5_000);
    expect(retry.lastError).toBe('timeout');
  });

  it('puts a permanent failure far away so the runner stops for a day', () => {
    expect(markFailed(entry({ attempts: 1 }), 'no right', NOW).nextAttemptAt).toBe(
      NOW + 86_400_000,
    );
  });
});

describe('list helpers', () => {
  it('replaces and removes by id', () => {
    const list = [entry({ id: 'a' }), entry({ id: 'b' })];
    expect(replaceEntry(list, entry({ id: 'a', attempts: 3 }))[0]?.attempts).toBe(3);
    expect(removeEntry(list, 'a').map((e) => e.id)).toEqual(['b']);
  });
});
