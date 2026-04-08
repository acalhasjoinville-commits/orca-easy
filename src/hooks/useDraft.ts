import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Generic draft persistence hook using sessionStorage.
 * Saves state with debounce, restores on mount, clears on successful save.
 *
 * @param key - sessionStorage key (e.g. "draft:orcamento-new" or "draft:orcamento-edit:abc123")
 * @param initialValue - default value when no draft exists
 * @param debounceMs - debounce interval for writes (default 400ms)
 */
export function useDraft<T>(
  key: string,
  initialValue: T,
  debounceMs = 400,
): [T, React.Dispatch<React.SetStateAction<T>>, () => void, boolean] {
  const [wasRestored, setWasRestored] = useState(false);

  const [state, setState] = useState<T>(() => {
    try {
      const stored = sessionStorage.getItem(key);
      if (stored) {
        setWasRestored(true);
        return JSON.parse(stored) as T;
      }
    } catch {
      // ignore parse errors
    }
    return initialValue;
  });

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const keyRef = useRef(key);
  const stateRef = useRef(state);
  keyRef.current = key;
  stateRef.current = state;

  const persistDraft = useCallback(() => {
    try {
      sessionStorage.setItem(keyRef.current, JSON.stringify(stateRef.current));
    } catch {
      // storage full or unavailable
    }
  }, []);

  // Debounced write to sessionStorage
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      persistDraft();
    }, debounceMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [state, debounceMs, persistDraft]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        persistDraft();
      }
    };

    const handlePageHide = () => {
      persistDraft();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handlePageHide);
      persistDraft();
    };
  }, [persistDraft]);

  const clearDraft = useCallback(() => {
    try {
      sessionStorage.removeItem(keyRef.current);
    } catch {
      // ignore
    }
  }, []);

  return [state, setState, clearDraft, wasRestored];
}
