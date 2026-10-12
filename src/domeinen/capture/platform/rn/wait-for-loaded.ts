import type { Sleep } from '@/shared/platform/ports';

export type Loadable = {
  isLoaded(): boolean;
};

/**
 * Polls until `isLoaded()` is true. Used so a quick tap after startup does not
 * fail before the bundled TFLite model finishes registering with ML Kit.
 */
export async function waitForLoaded<T extends Loadable>(
  loadable: T | undefined,
  options: { sleep: Sleep; attempts?: number; intervalMs?: number },
): Promise<T> {
  const attempts = options.attempts ?? 50;
  const intervalMs = options.intervalMs ?? 100;

  for (let i = 0; i < attempts; i += 1) {
    if (loadable !== undefined && loadable.isLoaded()) {
      return loadable;
    }
    await options.sleep(intervalMs);
  }

  throw new Error('Category model is not loaded');
}
