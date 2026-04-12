import { useState, useEffect, useRef, useCallback } from "react";

type DraftStorageType = "session" | "local";

function getStorage(type: DraftStorageType) {
  return type === "local" ? localStorage : sessionStorage;
}

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
  storageType: DraftStorageType = "session",
  enabled = true,
): [T, React.Dispatch<React.SetStateAction<T>>, () => void, boolean] {
  const restoredRef = useRef(false);
  const [wasRestored, setWasRestored] = useState(false);

  const [state, setState] = useState<T>(() => {
    if (!enabled) return initialValue;
    try {
      const stored = getStorage(storageType).getItem(key);
      if (stored) {
        restoredRef.current = true;
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
  const storageTypeRef = useRef(storageType);
  const enabledRef = useRef(enabled);
  keyRef.current = key;
  stateRef.current = state;
  storageTypeRef.current = storageType;
  enabledRef.current = enabled;

  useEffect(() => {
    setWasRestored(restoredRef.current);
  }, []);

  const persistDraft = useCallback(() => {
    if (!enabledRef.current) return;
    try {
      getStorage(storageTypeRef.current).setItem(keyRef.current, JSON.stringify(stateRef.current));
    } catch {
      // storage full or unavailable
    }
  }, []);

  // Debounced write to sessionStorage
  useEffect(() => {
    if (!enabled) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      persistDraft();
    }, debounceMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [state, debounceMs, persistDraft, enabled]);

  useEffect(() => {
    if (!enabled) return;
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
  }, [persistDraft, enabled]);

  const clearDraft = useCallback(() => {
    try {
      getStorage(storageTypeRef.current).removeItem(keyRef.current);
    } catch {
      // ignore
    }
  }, []);

  return [state, setState, clearDraft, wasRestored];
}
