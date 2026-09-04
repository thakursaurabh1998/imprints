'use client';

import { RefObject, useCallback, useEffect, useRef, useState } from 'react';

interface UseIdleVisibilityOptions {
  targetRef: RefObject<HTMLElement | null>;
  timeout?: number;
  ready: boolean;
}

/**
 * Tracks activity on targetRef and reports whether UI chrome should be
 * visible: shown on pointer movement (mouse hover/move — touch taps don't
 * generate this), hidden again after `timeout` ms of inactivity.
 * `pause`/`resume` let a control (e.g. a button under the cursor) suspend
 * the hide timer while it's being hovered. `toggle` flips visibility
 * explicitly, for touch devices where tapping the photo is the only way to
 * reveal/dismiss chrome (there's no hover to drive it).
 */
export function useIdleVisibility({
  targetRef,
  timeout = 2200,
  ready,
}: UseIdleVisibilityOptions) {
  const [visible, setVisible] = useState(true);
  const visibleRef = useRef(true);
  const pausedRef = useRef(false);
  const timerRef = useRef<number | null>(null);

  const setVisibleIfChanged = useCallback((next: boolean) => {
    if (visibleRef.current !== next) {
      visibleRef.current = next;
      setVisible(next);
    }
  }, []);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const scheduleHide = useCallback(() => {
    clearTimer();
    if (pausedRef.current) return;
    timerRef.current = window.setTimeout(() => {
      setVisibleIfChanged(false);
    }, timeout);
  }, [clearTimer, setVisibleIfChanged, timeout]);

  const show = useCallback(() => {
    setVisibleIfChanged(true);
    scheduleHide();
  }, [setVisibleIfChanged, scheduleHide]);

  const pause = useCallback(() => {
    pausedRef.current = true;
    clearTimer();
    setVisibleIfChanged(true);
  }, [clearTimer, setVisibleIfChanged]);

  const resume = useCallback(() => {
    pausedRef.current = false;
    scheduleHide();
  }, [scheduleHide]);

  const toggle = useCallback(() => {
    if (visibleRef.current) {
      pausedRef.current = false;
      clearTimer();
      setVisibleIfChanged(false);
    } else {
      show();
    }
  }, [clearTimer, setVisibleIfChanged, show]);

  useEffect(() => {
    if (!ready) return;
    const el = targetRef.current;
    if (!el) return;

    show();
    el.addEventListener('pointermove', show);

    return () => {
      el.removeEventListener('pointermove', show);
      clearTimer();
    };
  }, [ready, targetRef, show, clearTimer]);

  return { visible, pause, resume, toggle };
}
