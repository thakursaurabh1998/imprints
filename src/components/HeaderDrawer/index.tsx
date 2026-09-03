'use client';

import { useEffect, useRef, useState } from 'react';

import Description from '@/components/Description';
import Header from '@/components/Header';
import { useScrollLock } from '@/components/Lightbox/useScrollLock';
import styles from './HeaderDrawer.module.css';

export default function HeaderDrawer() {
  const [open, setOpen] = useState(false);
  const openDrawer = () => setOpen(true);

  return (
    <>
      <div className={styles.bar}>
        <Header openDrawer={openDrawer} />
      </div>

      {open && (
        <DrawerSheet openDrawer={openDrawer} onClose={() => setOpen(false)} />
      )}
    </>
  );
}

function DrawerSheet({
  openDrawer,
  onClose,
}: {
  openDrawer: () => void;
  onClose: () => void;
}) {
  const [visible, setVisible] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  useScrollLock({ containerRef: sheetRef });

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className={styles.overlay}>
      <div
        className={`${styles.backdrop} ${visible ? styles.visible : ''}`}
        onClick={onClose}
      />
      <div
        ref={sheetRef}
        className={`${styles.sheet} ${visible ? styles.open : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="About"
      >
        <Header openDrawer={openDrawer} />
        <Description />
      </div>
    </div>
  );
}
