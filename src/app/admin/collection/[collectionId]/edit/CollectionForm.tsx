import { Button, Grid, Paper, TextField } from '@mui/material';
import { useFormik } from 'formik';
import useSWRMutation from 'swr/mutation';

import SortableImageGrid from '@/components/SortableImageGrid';
import { Collection } from '@/utils/collection-config';

export default function CollectionForm({
  collection,
}: {
  collection: Collection;
}) {
  const { trigger } = useSWRMutation(
    `/api/admin/${collection.id}`,
    updateCollection,
  );

  const collectionForm = useFormik({
    initialValues: collection,
    onSubmit: async (updatedCollectionData) => {
      await trigger(updatedCollectionData);
    },
  });

  return (
    <form onSubmit={collectionForm.handleSubmit}>
      <Paper sx={{ p: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              id="title"
              name="title"
              label="Title"
              onChange={collectionForm.handleChange}
              value={collectionForm.values.title}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
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
              id="cover"
              name="cover"
              label="Cover"
              onChange={collectionForm.handleChange}
              defaultValue={collectionForm.values.cover}
            />
          </Grid>
          <Grid item xs={12}>
            <SortableImageGrid
              pictures={collectionForm.values.pictures}
              slug={collection.slug}
              onChange={(pictures) =>
                collectionForm.setFieldValue('pictures', pictures)
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

function updateCollection(url: string, { arg }: { arg: Collection }) {
  return fetch(url, {
    method: 'PUT',
    body: JSON.stringify(arg),
  });
}
