'use client';

import { Grid, Paper, TextField, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import useSWRMutation from 'swr/mutation';
import { v4 as uuid } from 'uuid';

import LoaderButton from '@/components/LoaderButton';
import { Collection } from '@/utils/collection-config';
import { hideInProduction } from '@/utils/hide-in-production';

export default function NewCollection() {
  hideInProduction();

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [id] = useState(() => uuid());
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');

  const { trigger } = useSWRMutation('/api/admin/new', createCollection);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await trigger({
      id,
      title,
      slug,
      description,
      cover: '',
      pictures: [],
    });

    if (res?.ok) {
      router.replace(`/admin/collections/${id}/edit`);
    } else {
      alert('Collection creation failed!');
      setLoading(false);
    }
  }

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
        <form onSubmit={handleSubmit}>
          <Paper sx={{ p: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  label="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <LoaderButton loading={loading}>Create</LoaderButton>
              </Grid>
            </Grid>
          </Paper>
        </form>
      </Grid>
    </Grid>
  );
}

function createCollection(url: string, { arg }: { arg: Partial<Collection> }) {
  return fetch(url, {
    method: 'POST',
    body: JSON.stringify(arg),
  });
}
