import Image from 'next/image';

import { getCollectionMeta } from '@/utils/collection-meta';
import { getCollectionsStaticPaths } from '@/utils/collections-static-paths';
import { isProduction } from '@/utils/is-production-environment';
import { notFound } from 'next/navigation';

export default function CollectionSet({
  params: { collection },
}: {
  params: { collection: string };
}) {
  if (isProduction()) {
    notFound();
  }

  return (
    <div>
      {getCollectionMeta(collection)?.pictures.map((picture: string) => (
        <Image
          height={200}
          width={200}
          key={picture}
          src={`/original/images/${collection}/${picture}`}
          alt="display"
        />
      ))}
    </div>
  );
}

export function generateStaticParams() {
  // When building for production, we don't want to expose the admin pages
  if (isProduction()) return [];

  return getCollectionsStaticPaths();
}
