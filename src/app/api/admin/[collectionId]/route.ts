import { NextRequest, NextResponse } from 'next/server';

import {
  Collection,
  renameDirectoriesUsingSlug,
  updateCollectionsAndWriteToJson,
} from '@/utils/collection-config';
import { getCollectionMetaById } from '@/utils/collection-meta';

export async function PUT(
  req: NextRequest,
  context: { params: { collectionId: string } },
) {
  const { collectionId } = context.params;
  const data: Collection = await req.json();

  const currentData = getCollectionMetaById(collectionId);

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
    await renameDirectoriesUsingSlug(currentData.slug, data.slug);
  }

  await updateCollectionsAndWriteToJson(collectionId, updatedCollection);

  return NextResponse.json(updatedCollection);
}
