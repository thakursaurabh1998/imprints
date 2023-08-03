import { notFound } from 'next/navigation';

import SortableImageGrid from '@/components/SortableImageGrid';
import { getCollectionMetaById } from '@/utils/collection-meta';
import { getCollectionsStaticPaths } from '@/utils/collections-static-paths';
import { isProduction } from '@/utils/is-production-environment';

export default function CollectionSet({
  params: { collectionId },
}: {
  params: { collectionId: string };
}) {
  if (isProduction()) {
    notFound();
  }

  const collectionMeta = getCollectionMetaById(collectionId);

  if (!collectionMeta) return notFound();

  return (
    <SortableImageGrid
      pictures={collectionMeta.pictures}
      slug={collectionMeta.slug}
    />
  );
}

export function generateStaticParams() {
  // When building for production, we don't want to expose the admin pages
  if (isProduction()) return [];

  return getCollectionsStaticPaths();
}
