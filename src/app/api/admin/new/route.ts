import { NextRequest, NextResponse } from 'next/server';

import config from '@/config';
import {
  addCollectionAndWriteToJson,
  Collection,
} from '@/utils/collection-config';

export async function POST(req: NextRequest) {
  const body: Collection = await req.json();

  const { description, id, slug, title } = body;

  if (!description || !id || !slug || !title) {
    return new Response('Missing required fields!', { status: 400 });
  }

  if (config.collections.some((c) => c.slug === slug || c.id === id)) {
    return new Response('Duplicate slug/id already exists!', { status: 400 });
  }

  await addCollectionAndWriteToJson(body);

  return NextResponse.json('success');
}
