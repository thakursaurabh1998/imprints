'use client';

import { Chip, Grid, Typography } from '@mui/material';
import { notFound } from 'next/navigation';
import { useState } from 'react';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';

import CollectionForm from '@/components/CollectionForm';
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

export default function CollectionSet({
  params: { collectionId },
}: {
  params: { collectionId: string };
}) {
  hideInProduction();

  const [loading, setLoading] = useState(false);

  const { data: collection, error: collectionError } = useSWR<Collection>(
    `/api/admin/${collectionId}`,
    fetcher,
  );
  const { data: draft, mutate: mutateDraft } = useSWR<Partial<Collection> | null>(
    `/api/admin/${collectionId}/draft`,
    fetcher,
  );

  const { trigger } = useSWRMutation(
    `/api/admin/${collectionId}`,
    updateCollection,
  );

  const saveDraft = useDebouncedCallback((values: Collection) => {
    fetch(`/api/admin/${collectionId}/draft`, {
      method: 'PUT',
      body: JSON.stringify(values),
    }).then(() => mutateDraft(values));
  }, 500);

  if (collectionError) {
    notFound();
  }

  // draft resolves to `null` (not undefined) once its fetch completes with
  // no draft on disk — waiting on `draft !== undefined` too avoids mounting
  // CollectionForm (and locking in Formik's initialValues) before we know
  // whether there's a draft to overlay.
  if (!collection || draft === undefined) {
    return null;
  }

  const hasDraft = Boolean(draft);
  const mergedCollection: Collection = hasDraft
    ? { ...collection, ...draft }
    : collection;

  const handleFormData = async (collectionData: Collection) => {
    setLoading(true);
    await trigger(collectionData);
    await fetch(`/api/admin/${collectionId}/draft`, { method: 'DELETE' });
    await mutateDraft(null);
    setLoading(false);
  };

  return (
    <Grid
      container
      flexDirection="column"
      paddingX={5}
      paddingY={2}
      rowSpacing={2}
    >
      <Grid item>
        <Typography variant="h2">
          {mergedCollection.title}
          {hasDraft && (
            <Chip
              label="Unpublished changes"
              color="warning"
              sx={{ ml: 2, verticalAlign: 'middle' }}
            />
          )}
        </Typography>
      </Grid>
      <Grid item sm={12} md={9}>
        <CollectionForm
          isLoading={loading}
          collection={mergedCollection}
          onSubmit={handleFormData}
          onChange={saveDraft}
        />
      </Grid>
    </Grid>
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
