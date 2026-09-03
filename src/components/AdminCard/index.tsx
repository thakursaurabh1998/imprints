import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Chip,
  Typography,
} from '@mui/material';
import { SyntheticEvent } from 'react';

import { Collection } from '@/utils/collection-config';
import { getPreviewSource, getThumbsFallbackSource } from '@/utils/picture-source';

export default function AdminCard({
  collection,
}: {
  collection: Collection & { hasDraft?: boolean };
}) {
  return (
    <Card sx={{ display: 'flex' }} style={{ height: '100%' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flex: '1 0 auto' }}>
          <Typography gutterBottom variant="h5" component="h2">
            {collection.title}

            <Chip
              style={{ marginBottom: 5, marginLeft: 20 }}
              label={<code>/{collection.slug}</code>}
            />
            {collection.hasDraft && (
              <Chip
                color="warning"
                style={{ marginBottom: 5, marginLeft: 10 }}
                label="Unpublished changes"
              />
            )}
          </Typography>

          <Typography variant="body2" color="text.secondary" component="p">
            {collection.description}
          </Typography>
        </CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', pl: 1, pb: 1 }}>
          <CardActions>
            <Button size="small" href={`/collection/${collection.slug}`}>
              Preview
            </Button>
            <Button
              variant="contained"
              size="small"
              href={`/admin/collections/${collection.id}/edit`}
            >
              Edit
            </Button>
          </CardActions>
        </Box>
      </Box>
      {collection.cover && (
        <CardMedia
          component="img"
          sx={{ width: 200 }}
          image={getPreviewSource(collection.slug, collection.cover)}
          alt={`Cover image for ${collection.title}`}
          onError={(e: SyntheticEvent<HTMLImageElement>) => {
            const fallback = getThumbsFallbackSource(collection.slug, collection.cover);
            if (e.currentTarget.src.endsWith(fallback)) return;
            e.currentTarget.src = fallback;
          }}
        />
      )}
    </Card>
  );
}
