'use client';

import { Grid, Typography } from '@mui/material';
import { notFound } from 'next/navigation';

import config from '@/config';
import { isProduction } from '@/utils/is-production-environment';
import CollectionForm from './CollectionForm';

export default function CollectionSet({
  params: { collectionId },
}: {
  params: { collectionId: string };
}) {
  if (isProduction()) {
    notFound();
  }

  const collectionObject = config.collections.find(
    (x) => x.id === collectionId,
  );

  if (!collectionObject) return notFound();

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
        <CollectionForm collection={collectionObject} />
      </Grid>
    </Grid>
  );
}
