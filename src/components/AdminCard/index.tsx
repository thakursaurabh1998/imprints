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

import { Collection } from '@/utils/collection-config';

export default function AdminCard({ collection }: { collection: Collection }) {
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
      <CardMedia
        component="img"
        sx={{ width: 200 }}
        image={`/original/images/${collection.slug}/${collection.cover}`}
        alt={`Cover image for ${collection.title}`}
      />
    </Card>
  );
}
