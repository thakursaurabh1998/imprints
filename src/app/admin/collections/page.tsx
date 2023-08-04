'use client';

import { Grid } from '@mui/material';

import AdminCard from '@/components/AdminCard';
import config from '@/config';
import { hideInProduction } from '@/utils/hide-in-production';

export default function AdminPanel() {
  hideInProduction();

  return (
    <div style={{ padding: 30 }}>
      <h1>Collections</h1>

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
