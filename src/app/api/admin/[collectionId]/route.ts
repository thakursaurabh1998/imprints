import { NextRequest, NextResponse } from 'next/server';

import {
  Collection,
  getCollectionById,
  renameDirectoriesUsingSlug,
  updateCollectionsAndWriteToJson,
} from '@/utils/collection-config';

export async function GET(
  req: NextRequest,
  context: { params: { collectionId: string } },
) {
  const collection = await getCollectionById(context.params.collectionId);

  if (!collection) {
    return new Response('Collection not found!', { status: 404 });
  }

  return NextResponse.json(collection);
}

export async function PUT(
  req: NextRequest,
  context: { params: { collectionId: string } },
) {
  const { collectionId } = context.params;
  const data: Collection = await req.json();

  const currentData = await getCollectionById(collectionId);

  if (!currentData) {
    return new Response('Collection not found!', { status: 404 });
  }

  const updatedCollection: Record<string, any> & Collection = {
    ...currentData,
  };

  for (const [key, value] of Object.entries(data)) {
    if (key in currentData) {
      updatedCollection[key] = value;
    }
  }

  if (currentData.slug !== data.slug) {
    try {
      await renameDirectoriesUsingSlug(currentData.slug, data.slug);
    } catch (err) {
      /*
       * Surface the reason instead of letting it become a bare 500. The client
       * shows the response text in a toast, and the common failure here — a
       * leftover directory already occupying the target slug — is only fixable
       * if you're told which path is in the way. The manifest is deliberately
       * left untouched, so nothing references directories that didn't move.
       */
      return new Response(
        err instanceof Error ? err.message : 'Could not rename the slug.',
        { status: 409 },
      );
    }
  }

  await updateCollectionsAndWriteToJson(collectionId, updatedCollection);

  return NextResponse.json(updatedCollection);
}
