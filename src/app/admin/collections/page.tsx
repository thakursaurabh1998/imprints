'use client';

import { Button, Grid } from '@mui/material';
import useSWR from 'swr';

import AdminCard from '@/components/AdminCard';
import { Collection } from '@/utils/collection-config';
import { hideInProduction } from '@/utils/hide-in-production';

async function fetcher(url: string) {
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Request to ${url} failed with status ${res.status}`);
  }

  return res.json();
}

export default function AdminPanel() {
  hideInProduction();

  const { data: collections } = useSWR<(Collection & { hasDraft: boolean })[]>(
    '/api/admin',
    fetcher,
  );

  return (
    <div style={{ padding: 30 }}>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <h1>Collections</h1>
        </Grid>
        <Grid item xs={6} width="100%">
          <Grid container justifyContent="flex-end">
            <Button
              variant="contained"
              color="primary"
              href="/admin/collections/new"
            >
              NEW COLLECTION
            </Button>
          </Grid>
        </Grid>
      </Grid>

      <Grid paddingTop={5} container spacing={2} rowSpacing={2}>
        {collections?.map((collection) => (
          <Grid item xs={12} sm={6} key={collection.slug}>
            <AdminCard collection={collection} />
          </Grid>
        ))}
      </Grid>
    </div>
  );
}
