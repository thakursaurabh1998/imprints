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
}

export default function PhotoCard({
  title,
  slug,
  description,
  cover,
  coverWidth,
  coverHeight,
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
