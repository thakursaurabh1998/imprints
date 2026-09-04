import { useCallback, useEffect, useRef } from 'react';

export function useDebouncedCallback<Args extends unknown[]>(
  // eslint-disable-next-line no-unused-vars
  callback: (...args: Args) => void,
  delayMs: number,
) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  return useCallback(
    (...args: Args) => {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => callbackRef.current(...args), delayMs);
    },
    [delayMs],
  );
}
