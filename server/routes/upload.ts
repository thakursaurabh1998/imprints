import path from 'node:path';

import { getCollectionById } from '../../src/utils/collection-config';
import { IS_PRODUCTION } from '../../src/utils/constants';
import {
  deleteUploadedImage,
  saveUploadedImage,
} from '../../src/utils/save-image';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const REJECTED_MIME_TYPES = ['image/heic', 'image/heif'];

export async function uploadImage(
  req: Request,
  params: { collectionId: string },
): Promise<Response> {
  if (IS_PRODUCTION) {
    return new Response('Not available in production', { status: 403 });
  }

  const { collectionId } = params;

  const formData = await req.formData();
  const imageFile = formData.get('file') as File | null;

  if (!imageFile) {
    return new Response('Image not parsable', { status: 400 });
  }

  const filename = path.basename(imageFile.name);

  if (REJECTED_MIME_TYPES.includes(imageFile.type)) {
    return new Response('HEIC not supported — convert to JPEG first', {
      status: 415,
    });
  }

  if (!ALLOWED_MIME_TYPES.includes(imageFile.type)) {
    return new Response(`Unsupported file type: ${imageFile.type}`, {
      status: 415,
    });
  }

  const collection = await getCollectionById(collectionId);

  if (!collection) {
    return new Response('Collection not found!', { status: 404 });
  }

  const relativeFilePath = `${collection.slug}/${filename}`;
  const imageBuffer = Buffer.from(await imageFile.arrayBuffer());

  try {
    await saveUploadedImage({ relativeFilePath, buffer: imageBuffer });
  } catch {
    await deleteUploadedImage({ relativeFilePath });
    return new Response(
      "Couldn't process image — is it a supported format?",
      { status: 415 },
    );
  }

  return Response.json({ filename });
}
