import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

type KeyboardToolbarContextValue = {
  /** When false, the global Prev/Next/Done bar is hidden (e.g. native search bar). */
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
};

const KeyboardToolbarContext = createContext<KeyboardToolbarContextValue | null>(null);

export function KeyboardToolbarProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabledState] = useState(true);
  const setEnabled = useCallback((next: boolean) => {
    setEnabledState(next);
  }, []);
  const value = useMemo(() => ({ enabled, setEnabled }), [enabled, setEnabled]);
  return (
    <KeyboardToolbarContext.Provider value={value}>{children}</KeyboardToolbarContext.Provider>
  );
}

export function useKeyboardToolbarEnabled(): boolean {
  const value = useContext(KeyboardToolbarContext);
  return value?.enabled ?? true;
}

/**
 * Suppress the global keyboard toolbar while a native search field is focused.
 * Re-enables on blur and when the caller unmounts.
 */
export function useSuppressKeyboardToolbar(): {
  onFocus: () => void;
  onBlur: () => void;
} {
  const value = useContext(KeyboardToolbarContext);
  const setEnabled = value?.setEnabled;

  const onFocus = useCallback(() => {
    setEnabled?.(false);
  }, [setEnabled]);

  const onBlur = useCallback(() => {
    setEnabled?.(true);
  }, [setEnabled]);

  useEffect(() => {
    return () => {
      setEnabled?.(true);
    };
  }, [setEnabled]);

  return { onFocus, onBlur };
}
