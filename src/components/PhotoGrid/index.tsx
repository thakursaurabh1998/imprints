'use client';

import { useRef, useState } from 'react';

import Lightbox from '@/components/Lightbox';
import { Collection } from '@/utils/collection-config';
import { getThumbsSource } from '@/utils/picture-source';
import { ThumbDimensionsMap } from '@/utils/thumb-dimensions';
import styles from './PhotoGrid.module.css';

interface PhotoGridProps {
  collection: Collection;
  /*
   * Thumb pixel dimensions keyed by filename, read from disk at build time. A
   * missing entry is the degraded path: the attributes are omitted and the tile
   * behaves as it did before, rather than being sized wrongly.
   */
  dimensions: ThumbDimensionsMap;
}

export default function PhotoGrid({ collection, dimensions }: PhotoGridProps) {
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
          {collection.pictures.map((image, index) => {
            const thumb = dimensions[image];
            /*
             * Index 0 is the top-left tile at every column count, so it is the
             * one image guaranteed above the fold and the likely LCP element.
             * Everything else stays lazy — eager-loading a 74-image collection
             * would pull ~21MB on load. Deliberately not "the first N": CSS
             * multi-column fills column-major, so the first N in DOM order are
             * a vertical strip down column 1, not the visible top band.
             */
            const isLeadImage = index === 0;

            return (
              <img
                key={image}
                ref={(el) => {
                  thumbRefs.current[index] = el;
                }}
                src={getThumbsSource(collection.slug, image)}
                alt={`${collection.title} — photo ${index + 1}`}
                /*
                 * Both or neither: the width/height presentational hint only
                 * yields an aspect ratio when the pair is complete.
                 */
                width={thumb?.width}
                height={thumb?.height}
                loading={isLeadImage ? undefined : 'lazy'}
                fetchPriority={isLeadImage ? 'high' : undefined}
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
            );
          })}
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
