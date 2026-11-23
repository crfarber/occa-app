import { describe, expect, it, vi } from 'vitest';
import { emptyListing } from '@/domeinen/capture';
import type { InterpretLabelsResult } from '@/domeinen/capture';
import { HttpError, NetworkError } from '@/shared/api/errors';
import type { MultipartUploadFiles } from '@/shared/platform/ports';
import { createFakeClock, createFakeScheduler, createInMemoryStore } from '@/test/fakes';
import type { ShopItemCreateApi } from '../api/shop-item-create';
import { createOutboxRepository } from './outbox-repository';
import { createSubmissionService } from './submission-service';

const result: InterpretLabelsResult = {
  category: { kind: 'known', category: 'jas', score: 0.9 },
  colors: ['zwart'],
  subtype: null,
  pattern: { kind: 'unknown' },
  labels: [],
  uncertainFields: [],
};

function fakeFiles(): MultipartUploadFiles {
  return {
    async prepare() {
      return { appendTo() {}, async remove() {} };
    },
    async fromUri() {
      return { appendTo() {}, async remove() {} };
    },
  };
}

function logger() {
  return {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    entries: () => [],
    clear: vi.fn(),
  };
}

describe('createSubmissionService', () => {
  it('creates the item then uploads each photo, and removes the entry when done', async () => {
    const create = vi.fn(async () => ({ itemId: 'item-1', created: true }));
    const uploadPhoto = vi.fn(async () => ({
      itemId: 'item-1',
      role: 'main' as const,
      stored: true,
      photoStatus: 'wachtend' as const,
    }));
    const api: ShopItemCreateApi = { create, uploadPhoto };
    const repository = createOutboxRepository(createInMemoryStore());
    const scheduler = createFakeScheduler();
    const service = createSubmissionService({
      repository,
      api,
      files: fakeFiles(),
      clock: createFakeClock(),
      scheduler,
      logger: logger(),
    });

    await service.enqueue({
      storeId: 'store-1',
      clientKey: 'scan-1000-1',
      photos: [
        { uri: 'file://main.jpg', role: 'overview' },
        { uri: 'file://label.jpg', role: 'label' },
      ],
      result,
      listing: { ...emptyListing(), brand: 'WE' },
    });
    expect(await repository.load()).toHaveLength(1);
    await scheduler.fireNext();

    expect(create).toHaveBeenCalledWith(
      'store-1',
      expect.objectContaining({ clientKey: 'scan-1000-1' }),
    );
    expect(uploadPhoto).toHaveBeenCalledTimes(2);
    expect(await repository.load()).toEqual([]);
  });

  it('keeps the entry and backs off on a temporary failure, then finishes on retry', async () => {
    const store = createInMemoryStore();
    const repository = createOutboxRepository(store);
    const create = vi
      .fn()
      .mockRejectedValueOnce(new NetworkError())
      .mockResolvedValueOnce({ itemId: 'item-1', created: true });
    const uploadPhoto = vi.fn(async () => ({
      itemId: 'item-1',
      role: 'main' as const,
      stored: true,
      photoStatus: 'wachtend' as const,
    }));
    const clock = createFakeClock();
    const scheduler = createFakeScheduler();
    const service = createSubmissionService({
      repository,
      api: { create, uploadPhoto },
      files: fakeFiles(),
      clock,
      scheduler,
      logger: logger(),
    });

    await service.enqueue({
      storeId: 'store-1',
      clientKey: 'scan-1000-1',
      photos: [{ uri: 'file://main.jpg', role: 'overview' }],
      result,
      listing: emptyListing(),
    });
    await scheduler.fireNext();
    const afterFail = await repository.load();
    expect(afterFail).toHaveLength(1);
    expect(afterFail[0]?.status).toBe('failed');
    expect(afterFail[0]?.nextAttemptAt).toBe(clock.now() + 5_000);

    clock.advance(5_000);
    await scheduler.fireNext();
    expect(await repository.load()).toEqual([]);
    expect(create).toHaveBeenCalledTimes(2);
    expect(uploadPhoto).toHaveBeenCalledTimes(1);
  });

  it('does not keep retrying a permanent refusal', async () => {
    const repository = createOutboxRepository(createInMemoryStore());
    const clock = createFakeClock();
    const scheduler = createFakeScheduler();
    const service = createSubmissionService({
      repository,
      api: {
        create: async () => {
          throw new HttpError(403, null, 'no');
        },
        uploadPhoto: async () => {
          throw new Error('unreachable');
        },
      },
      files: fakeFiles(),
      clock,
      scheduler,
      logger: logger(),
    });
    await service.enqueue({
      storeId: 'store-1',
      clientKey: 'scan-1000-1',
      photos: [{ uri: 'file://main.jpg', role: 'overview' }],
      result,
      listing: emptyListing(),
    });
    await scheduler.fireNext();
    const entries = await repository.load();
    expect(entries[0]?.nextAttemptAt).toBe(clock.now() + 86_400_000);
  });
});
