/**
 * The local outbox of scans waiting to reach the shop API (November 2026).
 * Pure rules: the repository stores the list, the service runs it.
 */

export const OUTBOX_STATUSES = ['pending', 'sending', 'failed'] as const;
export type OutboxStatus = (typeof OUTBOX_STATUSES)[number];

export type OutboxPhotoState = {
  photoKey: string;
  role: 'main' | 'label' | 'extra';
  uri: string;
  uploaded: boolean;
};

export type OutboxEntry = {
  id: string;
  clientKey: string;
  storeId: string;
  status: OutboxStatus;
  attempts: number;
  /** Set after the create call answered; photos use it. */
  itemId: string | null;
  fields: Record<string, unknown>;
  suggestions: Record<string, unknown>;
  photos: OutboxPhotoState[];
  createdAt: number;
  nextAttemptAt: number;
  lastError: string | null;
};

/** Backoff after a retryable failure: 5 s, 15 s, 45 s, then every 2 min. */
export function nextAttemptAt(attempts: number, now: number): number {
  const steps = [5_000, 15_000, 45_000, 120_000] as const;
  const delay = steps[Math.min(Math.max(attempts, 1), steps.length) - 1] ?? 120_000;
  return now + delay;
}

/** Entries due now, oldest first. A sending entry is left alone. */
export function dueEntries(entries: readonly OutboxEntry[], now: number): OutboxEntry[] {
  const due = entries.filter(
    (entry) =>
      (entry.status === 'pending' || entry.status === 'failed') && entry.nextAttemptAt <= now,
  );
  return [...due].sort((a, b) => a.createdAt - b.createdAt);
}

export function markSending(entry: OutboxEntry, now: number): OutboxEntry {
  return { ...entry, status: 'sending', attempts: entry.attempts + 1, nextAttemptAt: now };
}

export function markWaiting(
  entry: OutboxEntry,
  itemId: string | null,
  photos: OutboxPhotoState[],
): OutboxEntry {
  return {
    ...entry,
    status: 'pending',
    itemId: itemId ?? entry.itemId,
    photos,
    lastError: null,
    nextAttemptAt: 0,
  };
}

export function markRetryable(entry: OutboxEntry, error: string, now: number): OutboxEntry {
  return {
    ...entry,
    status: 'failed',
    lastError: error,
    nextAttemptAt: nextAttemptAt(entry.attempts, now),
  };
}

export function markFailed(entry: OutboxEntry, error: string, now: number): OutboxEntry {
  return {
    ...entry,
    status: 'failed',
    lastError: error,
    // Far ahead: the runner will not keep hammering a permanent refusal.
    nextAttemptAt: now + 24 * 60 * 60 * 1000,
  };
}

export function replaceEntry(entries: readonly OutboxEntry[], next: OutboxEntry): OutboxEntry[] {
  return entries.map((entry) => (entry.id === next.id ? next : entry));
}

export function removeEntry(entries: readonly OutboxEntry[], id: string): OutboxEntry[] {
  return entries.filter((entry) => entry.id !== id);
}
