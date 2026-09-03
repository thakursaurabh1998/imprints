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
}

export default function PhotoCard({
  title,
  slug,
  description,
  cover,
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
      <img src={cover} alt={title} className={styles.cover} />
      <div className={styles.content}>
        <h3 className={styles['collection-title']}>
          <Link href={`/collection/${slug}`}>{title.toUpperCase()}</Link>
        </h3>
        <p className={styles['collection-description']}>{description}</p>
      </div>
    </article>
  );
}
