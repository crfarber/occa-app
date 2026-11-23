import { z } from 'zod';
import type { KeyValueStore } from '@/shared/platform/ports';
import type { OutboxEntry } from '../domain/outbox';

/** Persisted outbox. One key per user device; cleared on sign-out. */
export const OUTBOX_STORAGE_KEY = 'submission.outbox';

const photoSchema = z.looseObject({
  photoKey: z.string().min(1),
  role: z.enum(['main', 'label', 'extra']),
  uri: z.string().min(1),
  uploaded: z.boolean(),
});

const entrySchema = z.looseObject({
  id: z.string().min(1),
  clientKey: z.string().min(1),
  storeId: z.string().min(1),
  status: z.enum(['pending', 'sending', 'failed']),
  attempts: z.number().int().nonnegative(),
  itemId: z.string().min(1).nullable(),
  fields: z.record(z.string(), z.unknown()),
  suggestions: z.record(z.string(), z.unknown()),
  photos: z.array(photoSchema),
  createdAt: z.number(),
  nextAttemptAt: z.number(),
  lastError: z.string().nullable(),
});

const listSchema = z.array(z.unknown()).transform((rows) => {
  const entries: OutboxEntry[] = [];
  for (const row of rows) {
    const parsed = entrySchema.safeParse(row);
    if (parsed.success) entries.push(parsed.data);
  }
  return entries;
});

export type OutboxRepository = {
  load(): Promise<OutboxEntry[]>;
  save(entries: OutboxEntry[]): Promise<void>;
  clear(): Promise<void>;
};

export function createOutboxRepository(store: KeyValueStore): OutboxRepository {
  return {
    async load() {
      const raw = await store.getItem(OUTBOX_STORAGE_KEY);
      if (raw === null || raw.trim() === '') return [];
      try {
        return listSchema.parse(JSON.parse(raw));
      } catch {
        return [];
      }
    },
    async save(entries) {
      await store.setItem(OUTBOX_STORAGE_KEY, JSON.stringify(entries));
    },
    async clear() {
      await store.removeItem(OUTBOX_STORAGE_KEY);
    },
  };
}
