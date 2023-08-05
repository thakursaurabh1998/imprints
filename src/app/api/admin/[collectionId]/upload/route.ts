import { NextRequest, NextResponse } from 'next/server';

import { updateCollectionsAndWriteToJson } from '@/utils/collection-config';
import { getCollectionMetaById } from '@/utils/collection-meta';
import { saveAllImageVariations } from '@/utils/save-image';

// NOTE: We are only uploading 1 image at a time
// so in case of multiple upload api calls, a race condition
// in reading and updating the collections file can occur leading to
// data loss. The client should always upload 1 by 1.
export async function POST(
  req: NextRequest,
  context: { params: { collectionId: string } },
) {
  const { collectionId } = context.params;

  const image = await req.formData();

  const imageFile = image.get('file') as File;

  if (!imageFile) {
    return new Response('Image not parsable', { status: 500 });
  }

  const collection = getCollectionMetaById(collectionId);

  if (!collection) {
    return new Response('Collection not found!', { status: 404 });
  }

  const imageBuffer = Buffer.from(await imageFile.arrayBuffer());

  await saveAllImageVariations({
    relativeFilePath: `${collection?.slug}/${imageFile.name}`,
    buffer: imageBuffer,
  });

  if (!collection.pictures.includes(imageFile.name)) {
    collection.pictures.push(imageFile.name);
  }

  await updateCollectionsAndWriteToJson(collectionId, collection);

  return NextResponse.json({ abc: 'Image file uploaded successfully' });
}
