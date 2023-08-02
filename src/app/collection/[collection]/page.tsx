import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import CarouselModal from '@/components/CarouselModal';
import PhotoGrid from '@/components/PhotoGrid';
import { getCollectionMeta } from '@/utils/collection-meta';
import { getCollectionsStaticPaths } from '@/utils/collections-static-paths';
import { Collection } from '@/utils/generate-collection-config';
import { generateCollectionMetadata } from '@/utils/generate-metadata';

type PhotoCollectionProps = {
  params: { collection: string };
};

export default function PhotoCollection({ params }: PhotoCollectionProps) {
  const collectionObject: Collection | null = getCollectionMeta(
    params.collection,
  );

  if (!collectionObject) notFound();

  return (
    <>
      <CarouselModal
        slug={collectionObject.slug}
        images={collectionObject.pictures}
      />
      <PhotoGrid>
        {collectionObject.pictures.map((image) => (
          <img
            key={image}
            src={`/images/thumbs/${collectionObject.slug}/${image}`}
            alt={image}
          />
        ))}
      </PhotoGrid>
    </>
  );
}

export const generateStaticParams = getCollectionsStaticPaths;

export function generateMetadata({ params }: PhotoCollectionProps): Metadata {
  const collectionObject = getCollectionMeta(params.collection);

  return {
    ...generateCollectionMetadata(collectionObject),
  };
}
