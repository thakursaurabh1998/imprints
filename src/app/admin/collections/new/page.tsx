'use client';

import { Grid, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useSWRConfig } from 'swr';
import useSWRMutation from 'swr/mutation';
import { v4 as uuid } from 'uuid';

import CollectionForm from '@/components/CollectionForm';
import { Collection } from '@/utils/collection-config';
import { uploadImage } from '@/utils/upload-image';

export default function NewCollection() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { mutate } = useSWRConfig();
  const { trigger } = useSWRMutation('/api/admin/new', createCollection);

  const handleFormData = async (
    collectionData: Collection,
    uploadedFiles: File[],
  ) => {
    setLoading(true);
    await trigger(collectionData, {
      onSuccess({ ok }) {
        if (ok) {
          router.replace('/admin/collections');
        } else {
          alert('Collection creation failed!');
        }
      },
    });

    for (const picture of uploadedFiles) {
      await mutate(
        `/api/admin/new`,
        uploadImage(`/api/admin/${collectionData.id}/upload`, { arg: picture }),
      );
    }
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
        <Typography variant="h2">New Collection</Typography>
      </Grid>
      <Grid item sm={12} md={9}>
        <CollectionForm
          createMode
          isLoading={loading}
          collection={{
            title: '',
            slug: '',
            pictures: [],
            description: '',
            cover: '',
            id: uuid(),
          }}
          onSubmit={handleFormData}
        />
      </Grid>
    </Grid>
  );
}

function createCollection(url: string, { arg }: { arg: Collection }) {
  return fetch(url, {
    method: 'POST',
    body: JSON.stringify(arg),
  });
}
