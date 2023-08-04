import { Button, Grid, Paper, TextField } from '@mui/material';
import { useFormik } from 'formik';
import Image from 'next/image';

import SortableImageGrid from '@/components/SortableImageGrid';
import { Collection } from '@/utils/collection-config';

export default function CollectionForm({
  collection,
  onSubmit,
}: {
  collection: Collection;
  // eslint-disable-next-line no-unused-vars
  onSubmit: (collection: Collection) => void;
}) {
  const collectionForm = useFormik({
    initialValues: collection,
    onSubmit,
  });

  return (
    <form onSubmit={collectionForm.handleSubmit}>
      <Paper sx={{ p: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              fullWidth
              id="title"
              name="title"
              label="Title"
              onChange={collectionForm.handleChange}
              value={collectionForm.values.title}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              id="slug"
              name="slug"
              label="Slug"
              onChange={collectionForm.handleChange}
              defaultValue={collectionForm.values.slug}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              id="description"
              name="description"
              label="Description"
              onChange={collectionForm.handleChange}
              defaultValue={collectionForm.values.description}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              id="cover"
              name="cover"
              label="Cover"
              onChange={collectionForm.handleChange}
              defaultValue={collectionForm.values.cover}
            />
          </Grid>
          <Grid item xs={12}>
            <SortableImageGrid
              items={collectionForm.values.pictures.map((picture) => ({
                id: picture,
                itemNode: (
                  <Image
                    height={200}
                    width={200}
                    quality={20}
                    key={picture}
                    src={`/original/images/${collection.slug}/${picture}`}
                    alt={picture}
                  />
                ),
              }))}
              onChange={(items) =>
                collectionForm.setFieldValue(
                  'pictures',
                  items.map((item) => item.id),
                )
              }
            />
          </Grid>
          {/* add more fields here */}
          <Grid item xs={12}>
            <Button variant="contained" color="primary" type="submit">
              Update
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </form>
  );
}
