import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import PhotoGrid from '@/components/PhotoGrid';
import { Collection, getCollectionDraft } from '@/utils/collection-config';
import { getCollectionMetaBySlug } from '@/utils/collection-meta';
import { getCollectionsStaticPaths } from '@/utils/collections-static-paths';
import { IS_PRODUCTION } from '@/utils/constants';
import { generateCollectionMetadata } from '@/utils/generate-metadata';
import { getThumbDimensionsMap } from '@/utils/thumb-dimensions';

type PhotoCollectionProps = {
  params: Promise<{ collection: string }>;
};

// Dev-only draft overlay so the admin editor's Preview button shows
// unpublished edits. In production this route is fully static-exported at
// build time (see next.config.js `output: 'export'`) — there's no
// request-time server to read .admin-scratch/drafts from, and saveDraft()
// already refuses to write one under IS_PRODUCTION. Gating before any fs
// call keeps prod/export behavior unchanged, same pattern as
// hideInProduction() for the admin pages.
async function withDraftOverlay(
  collectionObject: Collection | null,
): Promise<Collection | null> {
  if (IS_PRODUCTION || !collectionObject) return collectionObject;

  const draft = await getCollectionDraft(collectionObject.id);
  return draft ? { ...collectionObject, ...draft } : collectionObject;
}

export default async function PhotoCollection(props: PhotoCollectionProps) {
  const params = await props.params;
  const collectionObject = await withDraftOverlay(
    getCollectionMetaBySlug(params.collection),
  );

  if (!collectionObject) notFound();

  /*
   * Read at build time (this page is prerendered under `output: 'export'`) so
   * every tile can carry real width/height attributes and the masonry reserves
   * its final geometry on first paint. Scoped to this collection's pictures, so
   * the flight payload carries only what this page renders.
   */
  const dimensions = await getThumbDimensionsMap(
    collectionObject.slug,
    collectionObject.pictures,
  );

  return <PhotoGrid collection={collectionObject} dimensions={dimensions} />;
}

export const generateStaticParams = getCollectionsStaticPaths;

export async function generateMetadata(props: PhotoCollectionProps): Promise<Metadata> {
  const params = await props.params;
  const collectionObject = await withDraftOverlay(
    getCollectionMetaBySlug(params.collection),
  );

  return {
    ...generateCollectionMetadata(collectionObject),
  };
}
