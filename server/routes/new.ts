import {
  addCollectionAndWriteToJson,
  Collection,
  getCollections,
} from '../../src/utils/collection-config';

export async function createCollection(req: Request): Promise<Response> {
  const body: Collection = await req.json();

  const { description, id, slug, title } = body;

  if (!description || !id || !slug || !title) {
    return new Response('Missing required fields!', { status: 400 });
  }

  // Reads the live file rather than a build-time snapshot (the Next route
  // this replaces checked a bundled `@/config` import of collections.json
  // instead — stale by construction, and not something a standalone server
  // can rely on outside Next's build pipeline anyway).
  const collections = await getCollections();

  if (collections.some((c) => c.slug === slug || c.id === id)) {
    return new Response('Duplicate slug/id already exists!', { status: 400 });
  }

  await addCollectionAndWriteToJson(body);

  return Response.json('success');
}
