import { useEffect, useState } from 'react';
import { useScheduler } from './scheduler-context';

/**
 * Returns `value` after it has stayed the same for `delayMs`. Uses the
 * Scheduler port so tests can drive the timer without a real clock.
 */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const scheduler = useScheduler();
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const cancel = scheduler.schedule(() => {
      setDebounced(value);
    }, delayMs);
    return cancel;
  }, [value, delayMs, scheduler]);

  return debounced;
}
