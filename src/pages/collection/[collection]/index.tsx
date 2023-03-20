import Head from "next/head";
import { useState } from "react";

import config from "@/config";
import MetaTags from "@/components/Meta";
import PhotoGrid from "@/components/PhotoGrid";
import CarouselModal from "@/components/CarouselModal";

interface CollectionMeta {
  pictures: string[];
  title: string;
  description: string;
  slug: string;
  cover: string;
}

interface PhotoCollectionProps {
  collectionObject: CollectionMeta;
}

export async function getStaticPaths() {
  return {
    paths: config.collections.map((collection) => ({
      params: {
        collection: collection.slug,
      },
    })),
    fallback: false,
  };
}

export async function getStaticProps({
  params,
}: {
  params: {
    collection: string;
  };
}) {
  const collectionMeta = config.collections.find(
    (collection) => collection.slug === params.collection
  );

  return {
    props: {
      collectionObject: {
        collection: params.collection,
        ...collectionMeta,
      },
    },
  };
}

export default function PhotoCollection({
  collectionObject,
}: PhotoCollectionProps) {
  const [showCarousel, setShowCarousel] = useState(false);
  const [clickedImage, setClickedImage] = useState(0);

  function handleClickOnImage(index: number) {
    setClickedImage(index);
    setShowCarousel(true);
  }

  return (
    <>
      <Head>
        <title>{`${collectionObject.title} | ${config.title}`}</title>
        <meta name="description" content={collectionObject.description} />
      </Head>
      <MetaTags
        title={collectionObject.title}
        description={collectionObject.description}
        slug={collectionObject.slug}
        cover={`${config.baseUrl}/images/thumbs/${collectionObject.slug}/${collectionObject.cover}`}
      />
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
