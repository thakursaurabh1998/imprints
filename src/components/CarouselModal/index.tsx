'use client';

import Modal from '@mui/material/Modal';
import { useState } from 'react';

import CloseButton from '../CloseButton';
import PhotoCarousel from '../PhotoCarousel';

interface CarouselModalProps {
  images: string[];
  slug: string;
}

export default function CarouselModal({ images, slug }: CarouselModalProps) {
  const [showCarousel, setShowCarousel] = useState(false);

  return (
    <Modal open={showCarousel} onClose={() => setShowCarousel(false)}>
      <>
        <CloseButton onClick={() => setShowCarousel(false)} />
        <PhotoCarousel slug={slug} pictures={images} openedImage={0} />
      </>
    </Modal>
  );
}
