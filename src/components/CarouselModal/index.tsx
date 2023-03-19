import { Button } from "@mui/material";
import Modal from "@mui/material/Modal";
import PhotoCarousel from "../PhotoCarousel";

interface CarouselModalProps {
  show: boolean;
  handleClose: () => void;
  images: string[];
  openedImage: number;
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
        <Button onClick={() => handleClose()}>Close</Button>
        <PhotoCarousel pictures={images} openedImage={openedImage} />
      </>
    </Modal>
  );
}
