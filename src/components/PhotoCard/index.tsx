import Link from 'next/link';

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
  return (
    <Link href={`/collection/${slug}`} className={styles['collection-card']}>
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
        <h3 className={styles['collection-title']}>{title.toUpperCase()}</h3>
        <p className={styles['collection-description']}>{description}</p>
      </div>
    </Link>
  );
}
