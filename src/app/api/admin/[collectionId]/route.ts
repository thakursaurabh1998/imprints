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
    await renameDirectoriesUsingSlug(currentData.slug, data.slug);
  }

  await updateCollectionsAndWriteToJson(collectionId, updatedCollection);

  return NextResponse.json(updatedCollection);
}
