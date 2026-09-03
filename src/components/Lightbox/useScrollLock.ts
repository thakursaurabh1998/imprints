'use client';

import { RefObject, useEffect } from 'react';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function getFocusableElements(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  );
}

interface UseScrollLockOptions {
  containerRef: RefObject<HTMLElement | null>;
  returnFocusRef?: RefObject<HTMLElement | null>;
}

/**
 * Locks page scroll via `position: fixed` (reliable on iOS Safari, unlike
 * `overflow: hidden`) without touching `overflow-x` on html/body, traps
 * Tab focus inside containerRef, and restores scroll position + focus on
 * cleanup. Mount/unmount this hook's owning component per open/close cycle.
 */
export function useScrollLock({
  containerRef,
  returnFocusRef,
}: UseScrollLockOptions) {
  useEffect(() => {
    const { body } = document;
    const scrollY = window.scrollY;
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    const previousStyle = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      paddingRight: body.style.paddingRight,
    };

    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.left = '0';
    body.style.right = '0';
    body.style.width = '100%';
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const returnTarget = returnFocusRef?.current ?? previouslyFocused;

    const focusTimer = window.setTimeout(() => {
      const container = containerRef.current;
      if (!container) return;
      const [first] = getFocusableElements(container);
      (first ?? container).focus();
    }, 0);

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Tab') return;

      const container = containerRef.current;
      const focusable = container ? getFocusableElements(container) : [];
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener('keydown', handleKeyDown);

      body.style.position = previousStyle.position;
      body.style.top = previousStyle.top;
      body.style.left = previousStyle.left;
      body.style.right = previousStyle.right;
      body.style.width = previousStyle.width;
      body.style.paddingRight = previousStyle.paddingRight;

      window.scrollTo(0, scrollY);
      returnTarget?.focus?.();
    };
    // Intentionally empty: lock/unlock is tied to this component's
    // mount/unmount lifecycle, not to prop identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
