'use client';

import React, { useLayoutEffect, useRef } from 'react';

import styles from './AdminHeader.module.css';

export default function AdminHeader({
  eyebrow,
  backHref,
  backLabel = 'Collections',
  title,
  badges,
  actions,
}: {
  eyebrow?: string;
  backHref?: string;
  backLabel?: string;
  title: string;
  badges?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  const barRef = useRef<HTMLElement>(null);

  /*
   * Publish this bar's measured height as --a-admin-header so other sticky
   * surfaces (the collections table head) can tuck exactly underneath it.
   *
   * It has to be measured rather than hardcoded: the height is content-driven
   * — badges wrap, the title shrinks at 640px — so a static guess overlaps the
   * table head at some breakpoints and leaves a gap at others. Note the bar
   * must never size itself from this variable, or the ResizeObserver would
   * feed back into its own input.
   */
  useLayoutEffect(() => {
    const bar = barRef.current;
    const root = bar?.closest<HTMLElement>('.admin-root');

    if (!bar || !root) return;

    const publish = () =>
      root.style.setProperty(
        '--a-admin-header',
        `${Math.round(bar.getBoundingClientRect().height)}px`,
      );

    publish();

    const observer = new ResizeObserver(publish);
    observer.observe(bar);

    return () => observer.disconnect();
  }, []);

  return (
    <header ref={barRef} className={styles.bar}>
      <div className={styles.identity}>
        <span className={styles.eyebrow}>
          {backHref ? (
            <a href={backHref} className={styles.back}>
              ← {backLabel}
            </a>
          ) : (
            eyebrow || 'Imprints admin'
          )}
        </span>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>{title}</h1>
          {badges}
        </div>
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </header>
  );
}
