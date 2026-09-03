import { NextRequest, NextResponse } from 'next/server';

import { Collection } from '@/utils/collection-config';
import { DRAFT_DIRECTORY, IS_PRODUCTION } from '@/utils/constants';
import { deleteFileIfExists, fileExists, readJSONFile, writeJSONFile } from '@/utils/file-system';

export type CollectionDraft = Pick<
  Collection,
  'title' | 'slug' | 'description' | 'cover' | 'pictures'
>;

function draftPath(collectionId: string) {
  return `${DRAFT_DIRECTORY}/${collectionId}.json`;
}

export async function GET(
  req: NextRequest,
  context: { params: { collectionId: string } },
) {
  const filePath = draftPath(context.params.collectionId);

  if (!(await fileExists(filePath))) {
    return NextResponse.json(null);
  }

  const draft = await readJSONFile(filePath);
  return NextResponse.json(draft);
}

export async function PUT(
  req: NextRequest,
  context: { params: { collectionId: string } },
) {
  if (IS_PRODUCTION) {
    return new Response('Not available in production', { status: 403 });
  }

  const data: CollectionDraft = await req.json();
  await writeJSONFile(draftPath(context.params.collectionId), data);

  return NextResponse.json(data);
}

export async function DELETE(
  req: NextRequest,
  context: { params: { collectionId: string } },
) {
  await deleteFileIfExists(draftPath(context.params.collectionId));
  return NextResponse.json({ ok: true });
}
