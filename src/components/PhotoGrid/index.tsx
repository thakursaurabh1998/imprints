'use client';

import { useRef, useState } from 'react';

import Lightbox from '@/components/Lightbox';
import { Collection } from '@/utils/collection-config';
import { getThumbsSource } from '@/utils/picture-source';
import styles from './PhotoGrid.module.css';

interface PhotoGridProps {
  collection: Collection;
}

export default function PhotoGrid({ collection }: PhotoGridProps) {
  const [showLightbox, setShowLightbox] = useState(false);
  const [clickedImage, setClickedImage] = useState(0);
  const thumbRefs = useRef<Record<number, HTMLImageElement | null>>({});
  const returnFocusRef = useRef<HTMLImageElement | null>(null);

  function handleClickOnImage(index: number) {
    returnFocusRef.current = thumbRefs.current[index] ?? null;
    setClickedImage(index);
    setShowLightbox(true);
  }

  return (
    <>
      <div className={styles['photo-wrapper']}>
        <section id={styles.photos}>
          {collection.pictures.map((image, index) => (
            <img
              key={image}
              ref={(el) => {
                thumbRefs.current[index] = el;
              }}
              src={getThumbsSource(collection.slug, image)}
              alt={`${collection.title} — photo ${index + 1}`}
              loading="lazy"
              decoding="async"
              tabIndex={0}
              role="button"
              onClick={() => handleClickOnImage(index)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  handleClickOnImage(index);
                }
              }}
            />
          ))}
        </section>
      </div>

      {showLightbox && (
        <Lightbox
          slug={collection.slug}
          pictures={collection.pictures}
          initialIndex={clickedImage}
          onClose={() => setShowLightbox(false)}
          returnFocusRef={returnFocusRef}
        />
      )}
    </>
  );
}
