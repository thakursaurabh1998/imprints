'use client';

import { Grid, Typography } from '@mui/material';
import { notFound } from 'next/navigation';
import useSWRMutation from 'swr/mutation';

import CollectionForm from '@/components/CollectionForm';
import { Collection } from '@/utils/collection-config';
import { getCollectionMetaById } from '@/utils/collection-meta';
import { hideInProduction } from '@/utils/hide-in-production';

export default function CollectionSet({
  params: { collectionId },
}: {
  params: { collectionId: string };
}) {
  hideInProduction();

  const collectionObject = getCollectionMetaById(collectionId);

  if (!collectionObject) {
    notFound();
  }

  const { trigger } = useSWRMutation(
    `/api/admin/${collectionId}`,
    updateCollection,
  );

  const handleFormData = async (collectionData: Collection) => {
    await trigger(collectionData);
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
        <Typography variant="h2">{collectionObject?.title}</Typography>
      </Grid>
      <Grid item sm={12} md={9}>
        <CollectionForm
          collection={collectionObject}
          onSubmit={handleFormData}
        />
      </Grid>
    </Grid>
  );
}

function updateCollection(url: string, { arg }: { arg: Collection }) {
  return fetch(url, {
    method: 'PUT',
    body: JSON.stringify(arg),
  });
}
