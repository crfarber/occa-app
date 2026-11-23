import type { ListingDraft, InterpretLabelsResult, ScanPhoto } from '@/domeinen/capture';
import { HttpError, isRetryable } from '@/shared/api/errors';
import type { Clock, MultipartUploadFiles, Scheduler } from '@/shared/platform/ports';
import type { Logger } from '@/shared/logging/logger';
import type { ShopItemCreateApi } from '../api/shop-item-create';
import { payloadFromScan } from '../domain/map-scan';
import {
  dueEntries,
  markFailed,
  markRetryable,
  markSending,
  markWaiting,
  removeEntry,
  replaceEntry,
  type OutboxEntry,
  type OutboxPhotoState,
} from '../domain/outbox';
import type { OutboxRepository } from './outbox-repository';

/**
 * Queues a scan locally and sends it when the network allows (November 2026).
 * Create first (idempotent clientKey), then each photo (idempotent photoKey).
 * Temporary failures back off via the Scheduler; permanent ones wait a day.
 */

export type EnqueueScanInput = {
  storeId: string;
  photos: readonly ScanPhoto[];
  result: InterpretLabelsResult;
  listing: ListingDraft;
  /** Stable per scan; becomes clientKey (8–100 chars). */
  clientKey: string;
};

export type SubmissionService = {
  enqueue(input: EnqueueScanInput): Promise<OutboxEntry>;
  /** Drain what is due; safe to call often (start, foreground, after enqueue). */
  flush(): Promise<void>;
  clear(): Promise<void>;
};

export type SubmissionServiceDeps = {
  repository: OutboxRepository;
  api: ShopItemCreateApi;
  files: MultipartUploadFiles;
  clock: Clock;
  scheduler: Scheduler;
  logger: Logger;
};

function errorMessage(error: unknown): string {
  if (error instanceof HttpError) return `HTTP ${error.status}`;
  if (error instanceof Error) return error.message;
  return String(error);
}

export function createSubmissionService(deps: SubmissionServiceDeps): SubmissionService {
  let running = false;
  let cancelRetry: (() => void) | null = null;

  const scheduleNext = async (): Promise<void> => {
    cancelRetry?.();
    cancelRetry = null;
    const entries = await deps.repository.load();
    const now = deps.clock.now();
    const waiting = entries
      .filter((entry) => entry.status === 'pending' || entry.status === 'failed')
      .map((entry) => entry.nextAttemptAt)
      .filter((at) => at > now);
    if (waiting.length === 0) return;
    const soonest = Math.min(...waiting);
    cancelRetry = deps.scheduler.schedule(
      () => {
        cancelRetry = null;
        void service.flush();
      },
      Math.max(0, soonest - now),
    );
  };

  async function sendOne(entry: OutboxEntry): Promise<'done' | 'wait' | 'stop'> {
    let current = markSending(entry, deps.clock.now());
    await deps.repository.save(replaceEntry(await deps.repository.load(), current));

    try {
      let itemId = current.itemId;
      if (itemId === null) {
        const created = await deps.api.create(current.storeId, {
          clientKey: current.clientKey,
          fields: current.fields,
          suggestions: current.suggestions,
        });
        itemId = created.itemId;
        current = markWaiting(current, itemId, current.photos);
        await deps.repository.save(replaceEntry(await deps.repository.load(), current));
      }

      const photos: OutboxPhotoState[] = [];
      for (const photo of current.photos) {
        if (photo.uploaded) {
          photos.push(photo);
          continue;
        }
        const part = await deps.files.fromUri(photo.uri, {
          name: `${photo.photoKey}.jpg`,
          type: 'image/jpeg',
        });
        await deps.api.uploadPhoto(current.storeId, itemId, {
          role: photo.role,
          photoKey: photo.photoKey,
          photo: part,
        });
        photos.push({ ...photo, uploaded: true });
        current = markWaiting(current, itemId, photos);
        await deps.repository.save(replaceEntry(await deps.repository.load(), current));
      }

      await deps.repository.save(removeEntry(await deps.repository.load(), current.id));
      return 'done';
    } catch (error) {
      const message = errorMessage(error);
      const now = deps.clock.now();
      const next = isRetryable(error)
        ? markRetryable(current, message, now)
        : markFailed(current, message, now);
      await deps.repository.save(replaceEntry(await deps.repository.load(), next));
      deps.logger.warn('sync', 'Sending a scan failed', {
        entryId: current.id,
        retryable: isRetryable(error),
        error,
      });
      return isRetryable(error) ? 'wait' : 'stop';
    }
  }

  const service: SubmissionService = {
    async enqueue(input) {
      const payload = payloadFromScan(input);
      const now = deps.clock.now();
      const entry: OutboxEntry = {
        id: `${now}-${payload.clientKey}`,
        clientKey: payload.clientKey,
        storeId: input.storeId,
        status: 'pending',
        attempts: 0,
        itemId: null,
        fields: payload.fields,
        suggestions: payload.suggestions,
        photos: payload.photos.map((photo) => ({ ...photo, uploaded: false })),
        createdAt: now,
        nextAttemptAt: 0,
        lastError: null,
      };
      const entries = await deps.repository.load();
      await deps.repository.save([...entries, entry]);
      // After this call returns: the scan is safe on disk. Sending starts on
      // the next tick so the screen can show "queued" without waiting.
      deps.scheduler.schedule(() => {
        void service.flush();
      }, 0);
      return entry;
    },

    async flush() {
      if (running) return;
      running = true;
      try {
        for (;;) {
          const due = dueEntries(await deps.repository.load(), deps.clock.now());
          const next = due[0];
          if (next === undefined) break;
          await sendOne(next);
        }
      } finally {
        running = false;
        await scheduleNext();
      }
    },

    async clear() {
      cancelRetry?.();
      cancelRetry = null;
      await deps.repository.clear();
    },
  };

  return service;
}
