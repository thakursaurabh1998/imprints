import Modal from '@mui/material/Modal';

import CloseButton from '@/components/CloseButton';
import PhotoCarousel from '@/components/PhotoCarousel';

interface CarouselModalProps {
  show: boolean;
  images: string[];
  slug: string;
  openedImage: number;
  handleClose: () => void;
}

export default function CarouselModal({
  show,
  images,
  slug,
  openedImage,
  handleClose,
}: CarouselModalProps) {
  return (
    <Modal open={show} onClose={handleClose}>
      <>
        <CloseButton onClick={handleClose} />
        <PhotoCarousel
          slug={slug}
          pictures={images}
          openedImage={openedImage}
        />
      </>
    </Modal>
  );
}
