import { getCollectionById } from '../../src/utils/collection-config';
import {
  FULL_IMAGE_DIRECTORY,
  ORIGINAL_IMAGE_DIRECTORY,
  PREVIEW_IMAGE_DIRECTORY,
  THUMBS_IMAGE_DIRECTORY,
  TRASH_DIRECTORY,
} from '../../src/utils/constants';
import { moveFileToDirectory } from '../../src/utils/file-system';

const MOVABLE_DIRECTORIES: Record<string, string> = {
  original: ORIGINAL_IMAGE_DIRECTORY,
  preview: PREVIEW_IMAGE_DIRECTORY,
  thumbs: THUMBS_IMAGE_DIRECTORY,
  full: FULL_IMAGE_DIRECTORY,
};

export async function removePictures(
  req: Request,
  params: { collectionId: string },
): Promise<Response> {
  const { collectionId } = params;
  const { filenames, restore = false } = (await req.json()) as {
    filenames: string[];
    restore?: boolean;
  };

  if (!Array.isArray(filenames) || filenames.length === 0) {
    return new Response('filenames is required', { status: 400 });
  }

  const collection = await getCollectionById(collectionId);

  if (!collection) {
    return new Response('Collection not found!', { status: 404 });
  }

  const results = await Promise.all(
    filenames.map((filename) => moveOne(collection.slug, filename, restore)),
  );

  return Response.json({ results });
}

async function moveOne(slug: string, filename: string, restore: boolean) {
  const moved: string[] = [];

  for (const [label, directory] of Object.entries(MOVABLE_DIRECTORIES)) {
    const livePath = `${directory}/${slug}/${filename}`;
    const trashPath = `${TRASH_DIRECTORY}/${slug}/${label}/${filename}`;
    const [fromPath, toPath] = restore
      ? [trashPath, livePath]
      : [livePath, trashPath];

    if (await moveFileToDirectory({ fromPath, toPath })) {
      moved.push(label);
    }
  }

  return { filename, moved };
}
