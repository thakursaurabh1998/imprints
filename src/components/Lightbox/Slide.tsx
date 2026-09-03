'use client';

import { memo, useEffect, useRef, useState } from 'react';

import { getFullSource, getThumbsSource } from '@/utils/picture-source';
import styles from './Lightbox.module.css';

interface SlideProps {
  slug: string;
  filename: string;
  position: 'prev' | 'current' | 'next';
  active: boolean;
}

function Slide({ slug, filename, position, active }: SlideProps) {
  const [fullLoaded, setFullLoaded] = useState(false);
  const fullImageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    fullImageRef.current?.setAttribute(
      'fetchpriority',
      active ? 'high' : 'auto',
    );
  }, [active]);

  return (
    <div className={`${styles.slide} ${styles[position]}`}>
      <img
        src={getThumbsSource(slug, filename)}
        alt=""
        aria-hidden
        className={styles.thumb}
        decoding="async"
      />
      <img
        ref={fullImageRef}
        src={getFullSource(slug, filename)}
        alt={filename}
        className={`${styles.full} ${fullLoaded ? styles.loaded : ''}`}
        decoding="async"
        onLoad={() => setFullLoaded(true)}
      />
    </div>
  );
}

export default memo(Slide);
