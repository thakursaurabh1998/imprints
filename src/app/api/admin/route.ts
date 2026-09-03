import { NextResponse } from 'next/server';

import { getCollections } from '@/utils/collection-config';
import { DRAFT_DIRECTORY } from '@/utils/constants';
import { fileExists } from '@/utils/file-system';

export async function GET() {
  const collections = await getCollections();

  const collectionsWithDraftFlag = await Promise.all(
    collections.map(async (collection) => ({
      ...collection,
      hasDraft: await fileExists(`${DRAFT_DIRECTORY}/${collection.id}.json`),
    })),
  );

  return NextResponse.json(collectionsWithDraftFlag);
}
