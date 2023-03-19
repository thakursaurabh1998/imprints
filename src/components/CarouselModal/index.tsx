import Modal from "@mui/material/Modal";

import CloseButton from "../CloseButton";
import PhotoCarousel from "../PhotoCarousel";

interface CarouselModalProps {
  show: boolean;
  images: string[];
  openedImage: number;
  handleClose: () => void;
}

export default function CarouselModal({
  show,
  images,
  handleClose,
  openedImage,
}: CarouselModalProps) {
  return (
    <Modal open={show} onClose={handleClose}>
      <>
        <CloseButton onClick={() => handleClose()} />
        <PhotoCarousel pictures={images} openedImage={openedImage} />
      </>
    </Modal>
  );
}
