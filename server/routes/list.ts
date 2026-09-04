import { getCollections } from '../../src/utils/collection-config';
import { DRAFT_DIRECTORY } from '../../src/utils/constants';
import { fileExists } from '../../src/utils/file-system';

export async function listCollections(): Promise<Response> {
  const collections = await getCollections();

  const collectionsWithDraftFlag = await Promise.all(
    collections.map(async (collection) => ({
      ...collection,
      hasDraft: await fileExists(`${DRAFT_DIRECTORY}/${collection.id}.json`),
    })),
  );

  return Response.json(collectionsWithDraftFlag);
}
