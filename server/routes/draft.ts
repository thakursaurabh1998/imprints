import {
  CollectionDraft,
  getCollectionDraft,
} from '../../src/utils/collection-config';
import { DRAFT_DIRECTORY, IS_PRODUCTION } from '../../src/utils/constants';
import { deleteFileIfExists, writeJSONFile } from '../../src/utils/file-system';

function draftPath(collectionId: string) {
  return `${DRAFT_DIRECTORY}/${collectionId}.json`;
}

export async function getDraft(
  req: Request,
  params: { collectionId: string },
): Promise<Response> {
  const draft = await getCollectionDraft(params.collectionId);
  return Response.json(draft);
}

export async function saveDraft(
  req: Request,
  params: { collectionId: string },
): Promise<Response> {
  if (IS_PRODUCTION) {
    return new Response('Not available in production', { status: 403 });
  }

  const data: CollectionDraft = await req.json();
  await writeJSONFile(draftPath(params.collectionId), data);

  return Response.json(data);
}

export async function deleteDraft(
  req: Request,
  params: { collectionId: string },
): Promise<Response> {
  await deleteFileIfExists(draftPath(params.collectionId));
  return Response.json({ ok: true });
}
