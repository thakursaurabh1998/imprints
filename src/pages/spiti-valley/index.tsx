import Head from "next/head";
import { useState } from "react";

import PhotoGrid from "@/components/PhotoGrid";
import CarouselModal from "@/components/CarouselModal";

const images = [
  "/spiti-valley/IMG_0906.heic.jpeg",
  "/spiti-valley/IMG_1045.heic.jpeg",
  "/spiti-valley/IMG_1128.heic.jpeg",
  "/spiti-valley/IMG_1233.HEIC.jpeg",
  "/spiti-valley/IMG_1370.heic.jpeg",
  "/spiti-valley/IMG_0929.heic.jpeg",
  "/spiti-valley/IMG_1064.heic.jpeg",
  "/spiti-valley/IMG_1137.heic.jpeg",
  // "/spiti-valley/IMG_1277.heic.jpeg",
  // "/spiti-valley/IMG_1372.heic.jpeg",
  // "/spiti-valley/IMG_0932.heic.jpeg",
  // "/spiti-valley/IMG_1073.heic.jpeg",
  // "/spiti-valley/IMG_1158.heic.jpeg",
  // "/spiti-valley/IMG_1280.heic.jpeg",
  // "/spiti-valley/IMG_1374.heic.jpeg",
  // "/spiti-valley/IMG_0951.heic.jpeg",
  // "/spiti-valley/IMG_1090.heic.jpeg",
  // "/spiti-valley/IMG_1171.HEIC.jpeg",
  // "/spiti-valley/IMG_1292.heic.jpeg",
  // "/spiti-valley/IMG_1831.HEIC.jpeg",
  // "/spiti-valley/IMG_1039.heic.jpeg",
  // "/spiti-valley/IMG_1106.heic.jpeg",
  // "/spiti-valley/IMG_1229.heic.jpeg",
  // "/spiti-valley/IMG_1354.heic.jpeg",
];

export default function Spiti() {
  const [showCarousel, setShowCarousel] = useState(false);
  const [clickedImage, setClickedImage] = useState(0);

  function handleClickOnImage(index: number) {
    setClickedImage(index);
    setShowCarousel(true);
  }

  return (
    <>
      <CarouselModal
        show={showCarousel}
        images={images}
        openedImage={clickedImage}
        handleClose={() => setShowCarousel(false)}
      />
      <PhotoGrid name="Spiti Valley" description="Photos of Spiti">
        {images.map((image, index) => (
          <img
            key={image}
            src={"/images/thumbs" + image}
            alt={image}
            onClick={() => handleClickOnImage(index)}
          />
        ))}
      </PhotoGrid>
    </>
  );
}
