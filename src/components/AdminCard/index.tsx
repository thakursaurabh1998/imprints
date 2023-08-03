'use client';

import { Box, Card, CardContent, CardMedia, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';

import { Collection } from '@/utils/generate-collection-config';

export default function AdminCard({ collection }: { collection: Collection }) {
  const router = useRouter();

  return (
    <Card
      sx={{ display: 'flex' }}
      style={{ margin: 20, cursor: 'pointer' }}
      onClick={() => router.push(`/admin/collection/${collection.slug}`)}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flex: '1 0 auto' }}>
          <Typography gutterBottom variant="h5" component="h2">
            {collection.title}
          </Typography>
          <Typography gutterBottom component="p">
            slug: {collection.slug}
          </Typography>
          <Typography variant="body2" color="text.secondary" component="p">
            {collection.description}
          </Typography>
        </CardContent>
      </Box>
      <CardMedia
        component="img"
        sx={{ width: 151 }}
        image={`/original/images/${collection.slug}/${collection.cover}`}
        alt={`Cover image for ${collection.title}`}
      />
    </Card>
  );
}
