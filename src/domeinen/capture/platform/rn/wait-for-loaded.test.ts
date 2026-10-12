import { describe, expect, it } from 'vitest';
import { createRecordingSleep } from '@/test/fakes';
import { waitForLoaded } from './wait-for-loaded';

describe('waitForLoaded', () => {
  it('returns immediately when the model is already loaded', async () => {
    const { sleep, delays } = createRecordingSleep();
    const loadable = { isLoaded: () => true };

    await expect(waitForLoaded(loadable, { sleep })).resolves.toBe(loadable);
    expect(delays).toEqual([]);
  });

  it('waits until isLoaded becomes true', async () => {
    const { sleep, delays } = createRecordingSleep();
    let ready = false;
    const loadable = {
      isLoaded: () => ready,
    };

    const pending = waitForLoaded(loadable, { sleep, attempts: 5, intervalMs: 25 });
    ready = true;
    // First poll sees false, then sleep, then true.
    await expect(pending).resolves.toBe(loadable);
    expect(delays).toEqual([25]);
  });

  it('throws when the model never loads', async () => {
    const { sleep, delays } = createRecordingSleep();
    const loadable = { isLoaded: () => false };

    await expect(waitForLoaded(loadable, { sleep, attempts: 3, intervalMs: 10 })).rejects.toThrow(
      'Category model is not loaded',
    );
    expect(delays).toEqual([10, 10, 10]);
  });

  it('throws when the classifier handle is missing', async () => {
    const { sleep } = createRecordingSleep();

    await expect(waitForLoaded(undefined, { sleep, attempts: 2, intervalMs: 1 })).rejects.toThrow(
      'Category model is not loaded',
    );
  });
});
