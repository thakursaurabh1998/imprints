import { getCollectionById } from '../../src/utils/collection-config';
import { IS_PRODUCTION } from '../../src/utils/constants';
import {
  derivativesExist,
  originalImageExists,
  saveDerivatives,
} from '../../src/utils/save-image';

type DeriveResult = {
  filename: string;
  status: 'ok' | 'skipped' | 'error';
  reason?: string;
};

export async function deriveImages(
  req: Request,
  params: { collectionId: string },
): Promise<Response> {
  if (IS_PRODUCTION) {
    return new Response('Not available in production', { status: 403 });
  }

  const { filenames } = (await req.json()) as { filenames: string[] };

  if (!Array.isArray(filenames) || filenames.length === 0) {
    return new Response('filenames is required', { status: 400 });
  }

  const collection = await getCollectionById(params.collectionId);

  if (!collection) {
    return new Response('Collection not found!', { status: 404 });
  }

  const results = await Promise.all(
    filenames.map((filename) => deriveOne(collection.slug, filename)),
  );

  return Response.json({ results });
}

async function deriveOne(
  slug: string,
  filename: string,
): Promise<DeriveResult> {
  const relativeFilePath = `${slug}/${filename}`;

  if (await derivativesExist({ relativeFilePath })) {
    return { filename, status: 'skipped', reason: 'already generated' };
  }

  if (!(await originalImageExists({ relativeFilePath }))) {
    return { filename, status: 'skipped', reason: 'original missing' };
  }

  try {
    await saveDerivatives({ relativeFilePath });
    return { filename, status: 'ok' };
  } catch (error) {
    return {
      filename,
      status: 'error',
      reason: error instanceof Error ? error.message : 'unknown error',
    };
  }
}
