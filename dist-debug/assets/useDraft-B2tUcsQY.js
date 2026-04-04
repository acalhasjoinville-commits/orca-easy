import { r as reactExports } from "./react-vendor-ivNAblfg.js";
function useDraft(key, initialValue, debounceMs = 400) {
  const [wasRestored, setWasRestored] = reactExports.useState(false);
  const [state, setState] = reactExports.useState(() => {
    try {
      const stored = sessionStorage.getItem(key);
      if (stored) {
        setWasRestored(true);
        return JSON.parse(stored);
      }
    } catch {
    }
    return initialValue;
  });
  const timerRef = reactExports.useRef(null);
  const keyRef = reactExports.useRef(key);
  keyRef.current = key;
  reactExports.useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      try {
        sessionStorage.setItem(keyRef.current, JSON.stringify(state));
      } catch {
      }
    }, debounceMs);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [state, debounceMs]);
  const clearDraft = reactExports.useCallback(() => {
    try {
      sessionStorage.removeItem(keyRef.current);
    } catch {
    }
  }, []);
  return [state, setState, clearDraft, wasRestored];
}
export {
  useDraft as u
};
