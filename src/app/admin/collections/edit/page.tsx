'use client';

import { notFound, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';

import AdminHeader from '@/components/AdminHeader';
import CollectionForm from '@/components/CollectionForm';
import { Badge, Button, Spinner } from '@/components/ui';
import { ADMIN_API_URL } from '@/utils/admin-api';
import { Collection } from '@/utils/collection-config';
import { useDebouncedCallback } from '@/utils/debounce';
import { hideInProduction } from '@/utils/hide-in-production';

async function fetcher(url: string) {
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Request to ${url} failed with status ${res.status}`);
  }

  return res.json();
}

export default function CollectionSet() {
  hideInProduction();

  const collectionId = useSearchParams().get('id');

  const [loading, setLoading] = useState(false);

  const { data: collection, error: collectionError } = useSWR<Collection>(
    collectionId ? `${ADMIN_API_URL}/api/admin/${collectionId}` : null,
    fetcher,
  );
  const { data: draft, mutate: mutateDraft } =
    useSWR<Partial<Collection> | null>(
      collectionId ? `${ADMIN_API_URL}/api/admin/${collectionId}/draft` : null,
      fetcher,
    );

  const { trigger } = useSWRMutation(
    collectionId ? `${ADMIN_API_URL}/api/admin/${collectionId}` : null,
    updateCollection,
  );

  const saveDraft = useDebouncedCallback((values: Collection) => {
    if (!collectionId) return;

    fetch(`${ADMIN_API_URL}/api/admin/${collectionId}/draft`, {
      method: 'PUT',
      body: JSON.stringify(values),
    }).then(() => mutateDraft(values));
  }, 500);

  if (!collectionId || collectionError) {
    notFound();
  }

  // draft resolves to `null` (not undefined) once its fetch completes with
  // no draft on disk — waiting on `draft !== undefined` too avoids mounting
  // CollectionForm (and locking in Formik's initialValues) before we know
  // whether there's a draft to overlay.
  if (!collection || draft === undefined) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 11,
          padding: '80px 0',
          color: 'var(--a-text-dim)',
          fontSize: 13.5,
        }}
      >
        <Spinner /> Loading collection…
      </div>
    );
  }

  const hasDraft = Boolean(draft);
  const mergedCollection: Collection = hasDraft
    ? { ...collection, ...draft }
    : collection;

  const handleFormData = async (collectionData: Collection) => {
    setLoading(true);
    await trigger(collectionData);
    await fetch(`${ADMIN_API_URL}/api/admin/${collectionId}/draft`, {
      method: 'DELETE',
    });
    await mutateDraft(null);
    setLoading(false);
  };

  return (
    <>
      <AdminHeader
        backHref="/admin/collections"
        title={mergedCollection.title || 'Untitled collection'}
        badges={
          <>
            <Badge mono>/{mergedCollection.slug}</Badge>
            <Badge>{mergedCollection.pictures.length} photos</Badge>
            {hasDraft && (
              <Badge tone="accent" dot>
                Unpublished
              </Badge>
            )}
          </>
        }
        actions={
          <Button variant="ghost" href={`/collection/${mergedCollection.slug}`}>
            Preview
          </Button>
        }
      />

      <CollectionForm
        isLoading={loading}
        collection={mergedCollection}
        baseline={collection}
        onSubmit={handleFormData}
        onChange={saveDraft}
      />
    </>
  );
}

async function updateCollection(url: string, { arg }: { arg: Collection }) {
  const res = await fetch(url, {
    method: 'PUT',
    body: JSON.stringify(arg),
  });

  if (!res.ok) {
    throw new Error(`Update failed with status ${res.status}`);
  }

  return res.json();
}
