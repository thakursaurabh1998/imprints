import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import PhotoGrid from '@/components/PhotoGrid';
import { Collection } from '@/utils/collection-config';
import { getCollectionMetaBySlug } from '@/utils/collection-meta';
import { getCollectionsStaticPaths } from '@/utils/collections-static-paths';
import { generateCollectionMetadata } from '@/utils/generate-metadata';

type PhotoCollectionProps = {
  params: { collection: string };
};

export default function PhotoCollection({ params }: PhotoCollectionProps) {
  const collectionObject: Collection | null = getCollectionMetaBySlug(
    params.collection,
  );

  if (!collectionObject) notFound();

  return <PhotoGrid collection={collectionObject} />;
}

export const generateStaticParams = getCollectionsStaticPaths;

export function generateMetadata({ params }: PhotoCollectionProps): Metadata {
  const collectionObject = getCollectionMetaBySlug(params.collection);

  return {
    ...generateCollectionMetadata(collectionObject),
  };
}
