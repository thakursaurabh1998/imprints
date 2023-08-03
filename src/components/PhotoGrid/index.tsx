'use client';

import { useState } from 'react';

import { Collection } from '@/utils/generate-collection-config';
import CarouselModal from '../CarouselModal';
import styles from './PhotoGrid.module.css';

interface PhotoGridProps {
  collection: Collection;
}

export default function PhotoGrid({ collection }: PhotoGridProps) {
  const [showCarousel, setShowCarousel] = useState(false);
  const [clickedImage, setClickedImage] = useState(0);

  function handleClickOnImage(index: number) {
    setClickedImage(index);
    setShowCarousel(true);
  }

  return (
    <>
      <div className={styles['photo-wrapper']}>
        <section id={styles.photos}>
          {collection.pictures.map((image, index) => (
            <img
              key={image}
              src={`/images/thumbs/${collection.slug}/${image}`}
              alt={image}
              onClick={() => handleClickOnImage(index)}
            />
          ))}
        </section>
      </div>

      <CarouselModal
        show={showCarousel}
        handleClose={() => setShowCarousel(false)}
        openedImage={clickedImage}
        slug={collection.slug}
        images={collection.pictures}
      />
    </>
  );
}
