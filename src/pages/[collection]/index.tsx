import { useState } from "react";
import { useRouter } from "next/router";

import PhotoGrid from "@/components/PhotoGrid";
import CarouselModal from "@/components/CarouselModal";
import config from "@/config";
import Head from "next/head";

export default function Spiti() {
  const router = useRouter();
  const [showCarousel, setShowCarousel] = useState(false);
  const [clickedImage, setClickedImage] = useState(0);

  const { collection } = router.query;
  const collectionObject = config.collections.find(
    (abc) => abc.slug === collection
  ) ?? { pictures: [], title: "", description: "", slug: "" };

  function handleClickOnImage(index: number) {
    setClickedImage(index);
    setShowCarousel(true);
  }

  return (
    <>
      <Head>
        <title>
          {collectionObject.title} | {config.title}
        </title>
        <meta name="description" content={collectionObject.description} />
      </Head>
      <CarouselModal
        slug={collectionObject.slug}
        show={showCarousel}
        images={collectionObject.pictures}
        openedImage={clickedImage}
        handleClose={() => setShowCarousel(false)}
      />
      <PhotoGrid>
        {collectionObject.pictures.map((image, index) => (
          <img
            key={image}
            src={`/images/thumbs/${collectionObject.slug}/${image}`}
            alt={image}
            onClick={() => handleClickOnImage(index)}
          />
        ))}
      </PhotoGrid>
    </>
  );
}
