import {
  Collection,
  getCollectionById,
  renameDirectoriesUsingSlug,
  updateCollectionsAndWriteToJson,
} from '../../src/utils/collection-config';

export async function getCollection(
  req: Request,
  params: { collectionId: string },
): Promise<Response> {
  const collection = await getCollectionById(params.collectionId);

  if (!collection) {
    return new Response('Collection not found!', { status: 404 });
  }

  return Response.json(collection);
}

export async function updateCollection(
  req: Request,
  params: { collectionId: string },
): Promise<Response> {
  const { collectionId } = params;
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
      return new Response(
        err instanceof Error ? err.message : 'Could not rename the slug.',
        { status: 409 },
      );
    }
  }

  await updateCollectionsAndWriteToJson(collectionId, updatedCollection);

  return Response.json(updatedCollection);
}
