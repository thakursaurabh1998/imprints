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

    return fetch(`${ADMIN_API_URL}/api/admin/${collectionId}/draft`, {
      method: 'PUT',
      body: JSON.stringify(values),
    }).then(() => mutateDraft(values));
  }, 500);

  const [previewing, setPreviewing] = useState(false);

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

  const handlePreview = async () => {
    setPreviewing(true);
    // Best-effort — a flaky draft PUT shouldn't strand the user unable to
    // preview at all; worst case they see the last successfully saved draft.
    await saveDraft.flush().catch(() => {});
    // The PUBLISHED slug, not mergedCollection.slug — a draft-edited slug
    // has no entry in collections.json yet, so following it would 404
    // instead of showing a preview.
    //
    // A hard reload, not router.push() — /collection/[slug] is statically
    // generated, so the client router cache would happily serve a stale
    // copy from an earlier preview for up to 5 minutes (staleTimes.static).
    // That's exactly the bug this fixes; a full reload can't hit it.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = `/collection/${collection.slug}`;
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
          <Button
            variant="ghost"
            loading={previewing}
            disabled={previewing}
            onClick={handlePreview}
          >
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
