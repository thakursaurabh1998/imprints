'use client';

import { Button, Grid } from '@mui/material';

import AdminCard from '@/components/AdminCard';
import config from '@/config';
import { hideInProduction } from '@/utils/hide-in-production';

export default function AdminPanel() {
  hideInProduction();

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
        {config.collections.map((collection) => (
          <Grid item xs={12} sm={6} key={collection.slug}>
            <AdminCard collection={collection} />
          </Grid>
        ))}
      </Grid>
    </div>
  );
}
