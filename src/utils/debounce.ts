import { useEffect, useRef } from 'react';

type DebouncedCallback<Args extends unknown[]> = ((
  // eslint-disable-next-line no-unused-vars
  ...args: Args
) => void) & {
  /**
   * If a call is still pending in the timer, cancels it and runs the
   * callback immediately; if the timer already fired and that call's
   * effect is still in flight, waits for it instead; otherwise resolves
   * right away. Lets a caller await knowing the underlying effect has
   * actually settled, not just that a timer was cleared.
   */
  flush: () => Promise<void>;
};

export function useDebouncedCallback<Args extends unknown[]>(
  // eslint-disable-next-line no-unused-vars
  callback: (...args: Args) => unknown,
  delayMs: number,
): DebouncedCallback<Args> {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const delayRef = useRef(delayMs);
  delayRef.current = delayMs;

  const stateRef = useRef<{
    timeout: ReturnType<typeof setTimeout> | undefined;
    lastArgs: Args | null;
    inFlight: Promise<unknown> | null;
  }>({ timeout: undefined, lastArgs: null, inFlight: null });

  useEffect(() => () => clearTimeout(stateRef.current.timeout), []);

  // Built once (not via useCallback) so `flush` can be attached directly —
  // mutating a value returned by a hook isn't allowed, but this object is
  // fully assembled before it's ever stored anywhere.
  const debouncedRef = useRef<DebouncedCallback<Args>>(undefined);

  if (!debouncedRef.current) {
    const run = (...args: Args) => {
      const state = stateRef.current;
      const result = Promise.resolve(callbackRef.current(...args));
      state.inFlight = result;
      result.finally(() => {
        if (state.inFlight === result) state.inFlight = null;
      });
      return result;
    };

    const fn = ((...args: Args) => {
      const state = stateRef.current;
      state.lastArgs = args;
      clearTimeout(state.timeout);
      state.timeout = setTimeout(() => {
        state.timeout = undefined;
        run(...args);
      }, delayRef.current);
    }) as DebouncedCallback<Args>;

    fn.flush = async () => {
      const state = stateRef.current;

      if (state.timeout !== undefined && state.lastArgs !== null) {
        clearTimeout(state.timeout);
        state.timeout = undefined;
        await run(...state.lastArgs);
        return;
      }

      if (state.inFlight) await state.inFlight;
    };

    debouncedRef.current = fn;
  }

  return debouncedRef.current;
}
