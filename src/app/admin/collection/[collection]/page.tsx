import { notFound } from 'next/navigation';

import SortableImageGrid from '@/components/SortableImageGrid';
import { getCollectionMeta } from '@/utils/collection-meta';
import { getCollectionsStaticPaths } from '@/utils/collections-static-paths';
import { isProduction } from '@/utils/is-production-environment';

export default function CollectionSet({
  params: { collection },
}: {
  params: { collection: string };
}) {
  if (isProduction()) {
    notFound();
  }

  const collectionMeta = getCollectionMeta(collection);

  if (!collectionMeta) return null;

  return <SortableImageGrid collection={collectionMeta} />;
}

export function generateStaticParams() {
  // When building for production, we don't want to expose the admin pages
  if (isProduction()) return [];

  return getCollectionsStaticPaths();
}
