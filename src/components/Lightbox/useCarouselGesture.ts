'use client';

import { RefObject, useCallback, useEffect, useRef } from 'react';

const AXIS_LOCK_THRESHOLD_PX = 12;
// Horizontal swipe-to-navigate is the primary gesture; vertical dismiss is
// secondary. Real swipes (touch/trackpad) rarely move in a perfectly
// straight line, so a near-diagonal drag should resolve to horizontal —
// only lock to vertical when it's clearly the dominant axis.
const AXIS_LOCK_VERTICAL_BIAS = 1.4;
const HORIZONTAL_DISTANCE_RATIO = 0.25;
const HORIZONTAL_VELOCITY_THRESHOLD = 0.4; // px/ms
const VERTICAL_DISTANCE_RATIO = 0.15;
const VERTICAL_VELOCITY_THRESHOLD = 0.4; // px/ms
// A tiny movement can still register a huge instantaneous velocity (sensor
// noise, or the first sample after touchdown) — require a minimum distance
// before a "fast flick" alone can commit, so a jitter can't be mistaken for
// an intentional flick.
const MIN_FLICK_DISTANCE_PX = 30;
const VELOCITY_SAMPLE_WINDOW_MS = 100;
const EDGE_RESISTANCE = 0.35;
const SNAP_DURATION_MS = 260;
const SNAP_EASING = 'cubic-bezier(0.22, 0.61, 0.36, 1)';

type Axis = 'x' | 'y' | null;

interface Sample {
  time: number;
  x: number;
  y: number;
}

interface UseCarouselGestureOptions {
  stageRef: RefObject<HTMLElement | null>;
  trackRef: RefObject<HTMLElement | null>;
  fadeRefs?: Array<RefObject<HTMLElement | null>>;
  canGoPrev: boolean;
  canGoNext: boolean;
  // eslint-disable-next-line no-unused-vars
  onNavigate: (direction: 1 | -1) => void;
  onDismiss: () => void;
  // Lightbox renders null until its portal target exists, so stageRef.current
  // is still null on the commit where this hook's effects first run. Refs
  // don't participate in React's dependency comparison, so the effect below
  // needs an explicit signal (flips once the real DOM mounts) to know it
  // should try attaching listeners again.
  ready: boolean;
}

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

function velocityOf(samples: Sample[], axis: 'x' | 'y') {
  if (samples.length < 2) return 0;
  const latest = samples[samples.length - 1];
  const cutoff = latest.time - VELOCITY_SAMPLE_WINDOW_MS;
  const earliest = samples.find((sample) => sample.time >= cutoff) ?? samples[0];
  const dt = latest.time - earliest.time;
  if (dt <= 0) return 0;
  return (latest[axis] - earliest[axis]) / dt;
}

/**
 * Pointer-driven prev/next/dismiss gestures for the lightbox. Drag transform
 * is written straight to the DOM (trackRef/fadeRefs) rather than through
 * React state — per-frame setState during a drag is a real jank source.
 * Only a completed gesture calls back into React (onNavigate/onDismiss).
 */
export function useCarouselGesture({
  stageRef,
  trackRef,
  fadeRefs = [],
  canGoPrev,
  canGoNext,
  onNavigate,
  onDismiss,
  ready,
}: UseCarouselGestureOptions) {
  const latest = useRef({ canGoPrev, canGoNext, onNavigate, onDismiss });
  latest.current = { canGoPrev, canGoNext, onNavigate, onDismiss };

  const didDragRef = useRef(false);

  const setTrackStyle = useCallback(
    (dx: number, dy: number, opacity: number, scale: number, transition: string) => {
      const track = trackRef.current;
      if (track) {
        track.style.transition = transition;
        track.style.transform = `translate3d(${dx}px, ${dy}px, 0) scale(${scale})`;
        track.style.opacity = String(opacity);
      }
      fadeRefs.forEach((ref) => {
        const el = ref.current;
        if (!el) return;
        el.style.transition = transition;
        el.style.opacity = String(opacity);
      });
    },
    [trackRef, fadeRefs],
  );

  const animateTo = useCallback(
    (
      dx: number,
      dy: number,
      opacity: number,
      scale: number,
      onDone?: () => void,
    ) => {
      const reduceMotion = prefersReducedMotion();
      const track = trackRef.current;

      if (reduceMotion || !track) {
        setTrackStyle(dx, dy, opacity, scale, 'none');
        onDone?.();
        return;
      }

      const transition = `transform ${SNAP_DURATION_MS}ms ${SNAP_EASING}, opacity ${SNAP_DURATION_MS}ms ${SNAP_EASING}`;
      let settled = false;

      const finish = () => {
        if (settled) return;
        settled = true;
        track.removeEventListener('transitionend', finish);
        window.clearTimeout(fallbackTimer);
        onDone?.();
      };

      track.addEventListener('transitionend', finish);
      const fallbackTimer = window.setTimeout(finish, SNAP_DURATION_MS + 50);

      setTrackStyle(dx, dy, opacity, scale, transition);
    },
    [trackRef, setTrackStyle],
  );

  const settleToIdentity = useCallback(() => {
    animateTo(0, 0, 1, 1);
  }, [animateTo]);

  const commitNavigate = useCallback(
    (direction: 1 | -1) => {
      const stage = stageRef.current;
      const width = stage?.clientWidth ?? window.innerWidth;
      animateTo(direction === 1 ? -width : width, 0, 1, 1, () => {
        setTrackStyle(0, 0, 1, 1, 'none');
        latest.current.onNavigate(direction);
      });
    },
    [animateTo, setTrackStyle, stageRef],
  );

  const commitDismiss = useCallback(() => {
    const stage = stageRef.current;
    const height = stage?.clientHeight ?? window.innerHeight;
    animateTo(0, height, 0, 0.85, () => {
      latest.current.onDismiss();
    });
  }, [animateTo, stageRef]);

  const triggerPrev = useCallback(() => {
    if (!latest.current.canGoPrev) return;
    commitNavigate(-1);
  }, [commitNavigate]);

  const triggerNext = useCallback(() => {
    if (!latest.current.canGoNext) return;
    commitNavigate(1);
  }, [commitNavigate]);

  useEffect(() => {
    if (!stageRef.current) return;
    const stage: HTMLElement = stageRef.current;

    const state = {
      pointerId: null as number | null,
      startX: 0,
      startY: 0,
      axis: null as Axis,
      samples: [] as Sample[],
    };

    function resetState() {
      state.pointerId = null;
      state.axis = null;
      state.samples = [];
    }

    function handlePointerDown(event: PointerEvent) {
      if (state.pointerId !== null) return; // ignore a second pointer
      if (event.pointerType === 'mouse' && event.button !== 0) return;

      state.pointerId = event.pointerId;
      state.startX = event.clientX;
      state.startY = event.clientY;
      state.axis = null;
      state.samples = [{ time: performance.now(), x: event.clientX, y: event.clientY }];
      didDragRef.current = false;

      stage.setPointerCapture(event.pointerId);
      setTrackStyle(0, 0, 1, 1, 'none');
    }

    function handlePointerMove(event: PointerEvent) {
      if (state.pointerId !== event.pointerId) return;

      const dx = event.clientX - state.startX;
      const dy = event.clientY - state.startY;

      if (state.axis === null) {
        if (Math.abs(dx) < AXIS_LOCK_THRESHOLD_PX && Math.abs(dy) < AXIS_LOCK_THRESHOLD_PX) {
          return;
        }
        state.axis =
          Math.abs(dy) > Math.abs(dx) * AXIS_LOCK_VERTICAL_BIAS ? 'y' : 'x';
        didDragRef.current = true;
      }

      state.samples.push({ time: performance.now(), x: event.clientX, y: event.clientY });
      const cutoff = performance.now() - VELOCITY_SAMPLE_WINDOW_MS * 4;
      while (state.samples.length > 2 && state.samples[0].time < cutoff) {
        state.samples.shift();
      }

      if (state.axis === 'x') {
        let visualDx = dx;
        const blockedPrev = dx > 0 && !latest.current.canGoPrev;
        const blockedNext = dx < 0 && !latest.current.canGoNext;
        if (blockedPrev || blockedNext) {
          visualDx = dx * EDGE_RESISTANCE;
        }
        setTrackStyle(visualDx, 0, 1, 1, 'none');
      } else {
        const stageHeight = stage.clientHeight || window.innerHeight;
        const visualDy = dy > 0 ? dy : dy * EDGE_RESISTANCE;
        const progress = Math.min(Math.max(visualDy, 0) / (stageHeight * 0.6), 1);
        const opacity = 1 - progress * 0.7;
        const scale = 1 - progress * 0.15;
        setTrackStyle(0, visualDy, opacity, scale, 'none');
      }
    }

    function finishGesture(event: PointerEvent) {
      if (state.pointerId !== event.pointerId) return;

      const axis = state.axis;
      const dx = event.clientX - state.startX;
      const dy = event.clientY - state.startY;
      const velocityX = velocityOf(state.samples, 'x');
      const velocityY = velocityOf(state.samples, 'y');

      if (stage.hasPointerCapture(event.pointerId)) {
        stage.releasePointerCapture(event.pointerId);
      }
      resetState();

      if (axis === 'x') {
        const width = stage.clientWidth || window.innerWidth;
        const distanceRatio = Math.abs(dx) / width;
        const wantsCommit =
          distanceRatio > HORIZONTAL_DISTANCE_RATIO ||
          (Math.abs(dx) > MIN_FLICK_DISTANCE_PX &&
            Math.abs(velocityX) > HORIZONTAL_VELOCITY_THRESHOLD);
        const direction: 1 | -1 = dx < 0 ? 1 : -1;
        const blocked = direction === 1 ? !latest.current.canGoNext : !latest.current.canGoPrev;

        if (wantsCommit && !blocked) {
          commitNavigate(direction);
        } else {
          settleToIdentity();
        }
      } else if (axis === 'y') {
        const height = stage.clientHeight || window.innerHeight;
        const distanceRatio = dy / height;
        const wantsDismiss =
          dy > 0 &&
          (distanceRatio > VERTICAL_DISTANCE_RATIO ||
            (dy > MIN_FLICK_DISTANCE_PX && velocityY > VERTICAL_VELOCITY_THRESHOLD));

        if (wantsDismiss) {
          commitDismiss();
        } else {
          settleToIdentity();
        }
      } else {
        settleToIdentity();
      }
    }

    function handlePointerCancel(event: PointerEvent) {
      if (state.pointerId !== event.pointerId) return;
      if (stage.hasPointerCapture(event.pointerId)) {
        stage.releasePointerCapture(event.pointerId);
      }
      resetState();
      settleToIdentity();
    }

    stage.addEventListener('pointerdown', handlePointerDown);
    stage.addEventListener('pointermove', handlePointerMove);
    stage.addEventListener('pointerup', finishGesture);
    stage.addEventListener('pointercancel', handlePointerCancel);
    stage.addEventListener('lostpointercapture', handlePointerCancel);

    return () => {
      stage.removeEventListener('pointerdown', handlePointerDown);
      stage.removeEventListener('pointermove', handlePointerMove);
      stage.removeEventListener('pointerup', finishGesture);
      stage.removeEventListener('pointercancel', handlePointerCancel);
      stage.removeEventListener('lostpointercapture', handlePointerCancel);
    };
  }, [ready, stageRef, setTrackStyle, commitNavigate, commitDismiss, settleToIdentity]);

  return { triggerPrev, triggerNext, didDragRef };
}
