'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react';

import styles from './PhotoCard.module.css';

interface PhotoCardProps {
  title: string;
  slug: string;
  description: string;
  cover: string;
  /*
   * Cover thumb dimensions, read from disk at build time. Both or neither — the
   * width/height presentational hint only yields an aspect ratio as a pair.
   */
  coverWidth?: number;
  coverHeight?: number;
  /* Set on the first card only: the one cover guaranteed above the fold. */
  priority?: boolean;
}

export default function PhotoCard({
  title,
  slug,
  description,
  cover,
  coverWidth,
  coverHeight,
  priority = false,
}: PhotoCardProps) {
  const router = useRouter();

  function handleCardClick(event: React.MouseEvent<HTMLElement>) {
    if ((event.target as HTMLElement).closest('a')) return;
    router.push(`/collection/${slug}`);
  }

  return (
    <article
      onClick={handleCardClick}
      className={styles['collection-card']}
    >
      <img
        src={cover}
        alt={title}
        className={styles.cover}
        width={coverWidth}
        height={coverHeight}
        /*
         * Previously unset, which made all 18 covers eager — several MB on
         * first paint for images mostly below the fold.
         */
        loading={priority ? undefined : 'lazy'}
        fetchPriority={priority ? 'high' : undefined}
        decoding="async"
      />
      <div className={styles.content}>
        <h3 className={styles['collection-title']}>
          <Link href={`/collection/${slug}`}>{title.toUpperCase()}</Link>
        </h3>
        <p className={styles['collection-description']}>{description}</p>
      </div>
    </article>
  );
}
