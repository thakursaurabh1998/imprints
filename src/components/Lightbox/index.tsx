'use client';

import React, {
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

import Slide from './Slide';
import styles from './Lightbox.module.css';
import { useCarouselGesture } from './useCarouselGesture';
import { useIdleVisibility } from './useIdleVisibility';
import { useScrollLock } from './useScrollLock';

interface LightboxProps {
  slug: string;
  pictures: string[];
  initialIndex: number;
  onClose: () => void;
  returnFocusRef?: RefObject<HTMLElement | null>;
}

export default function Lightbox({
  slug,
  pictures,
  initialIndex,
  onClose,
  returnFocusRef,
}: LightboxProps) {
  const [index, setIndex] = useState(initialIndex);
  const [portalReady, setPortalReady] = useState(false);

  const dialogRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const chromeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  const canGoPrev = index > 0;
  const canGoNext = index < pictures.length - 1;

  const fadeRefs = useMemo(() => [backdropRef, chromeRef], []);

  const { triggerPrev, triggerNext, didDragRef } = useCarouselGesture({
    stageRef,
    trackRef,
    fadeRefs,
    canGoPrev,
    canGoNext,
    onNavigate: (direction) =>
      setIndex((current) =>
        Math.min(Math.max(current + direction, 0), pictures.length - 1),
      ),
    onDismiss: onClose,
    ready: portalReady,
    index,
  });

  useScrollLock({ containerRef: dialogRef, returnFocusRef });

  const {
    visible: controlsVisible,
    pause: pauseIdle,
    resume: resumeIdle,
    toggle: toggleControls,
  } = useIdleVisibility({ targetRef: dialogRef, ready: portalReady });

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      } else if (event.key === 'ArrowLeft') {
        triggerPrev();
      } else if (event.key === 'ArrowRight') {
        triggerNext();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, triggerPrev, triggerNext]);

  const handleStageClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (didDragRef.current) {
        didDragRef.current = false;
        return;
      }
      if (event.target instanceof HTMLImageElement) {
        toggleControls();
        return;
      }
      onClose();
    },
    [didDragRef, onClose, toggleControls],
  );

  if (!portalReady) return null;

  return createPortal(
    <div
      ref={dialogRef}
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label={`Photo ${index + 1} of ${pictures.length}`}
    >
      <div ref={backdropRef} className={styles.backdrop} />

      <div
        ref={stageRef}
        className={styles.stage}
        onClick={handleStageClick}
      >
        <div ref={trackRef} className={styles.track}>
          {canGoPrev && (
            <Slide
              key={pictures[index - 1]}
              slug={slug}
              filename={pictures[index - 1]}
              position="prev"
              active={false}
            />
          )}
          <Slide
            key={pictures[index]}
            slug={slug}
            filename={pictures[index]}
            position="current"
            active
          />
          {canGoNext && (
            <Slide
              key={pictures[index + 1]}
              slug={slug}
              filename={pictures[index + 1]}
              position="next"
              active={false}
            />
          )}
        </div>
      </div>

      <div
        ref={chromeRef}
        className={`${styles.chrome} ${controlsVisible ? '' : styles.idle}`}
      >
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          onPointerEnter={pauseIdle}
          onPointerLeave={resumeIdle}
          aria-label="Close"
        >
          <img height={20} width={20} alt="" src="/assets/close.svg" />
        </button>

        {canGoPrev && (
          <button
            type="button"
            className={`${styles.nav} ${styles.navPrev}`}
            onClick={triggerPrev}
            onPointerEnter={pauseIdle}
            onPointerLeave={resumeIdle}
            aria-label="Previous photo"
          >
            &#8249;
          </button>
        )}

        {canGoNext && (
          <button
            type="button"
            className={`${styles.nav} ${styles.navNext}`}
            onClick={triggerNext}
            onPointerEnter={pauseIdle}
            onPointerLeave={resumeIdle}
            aria-label="Next photo"
          >
            &#8250;
          </button>
        )}

        <div className={styles.counter}>
          {index + 1} / {pictures.length}
        </div>
      </div>
    </div>,
    document.body,
  );
}
