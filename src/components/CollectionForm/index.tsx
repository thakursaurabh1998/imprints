import { Button, Grid, Paper, TextField } from '@mui/material';
import { useFormik } from 'formik';
import Image from 'next/image';
import { useState } from 'react';

import SortableGrid from '@/components/SortableGrid';
import { Collection } from '@/utils/collection-config';
import UploadDrawer from '../UploadDrawer';

export default function CollectionForm({
  createMode = false,
  collection,
  onSubmit,
}: {
  createMode?: boolean;
  collection: Collection;
  // eslint-disable-next-line no-unused-vars
  onSubmit: (collection: Collection) => void;
}) {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const collectionForm = useFormik({
    initialValues: collection,
    onSubmit,
  });

  function getPictureSource(picture: string) {
    if (createMode) {
      const imageFile = uploadedFiles.find((x) => x.name === picture)!;
      return URL.createObjectURL(imageFile);
    }

    return `/original/images/${collection.slug}/${picture}`;
  }

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
            <Grid container paddingBottom={1}>
              <Grid item xs={1} margin="auto">
                <h3>Pictures</h3>
              </Grid>
              <Grid item xs={11}>
                <UploadDrawer
                  collectionId={collection.id}
                  show={uploadModalOpen}
                  handleClose={(uploadedImages) => {
                    if (!createMode) {
                      window.location.reload();
                    }
                    if (uploadedImages) {
                      setUploadedFiles(uploadedImages);
                    }
                    setUploadModalOpen(false);
                  }}
                />
                <Button
                  variant="outlined"
                  onClick={() => setUploadModalOpen(true)}
                >
                  Upload
                </Button>
              </Grid>
            </Grid>
            <SortableGrid
              items={collectionForm.values.pictures.map((picture) => ({
                id: picture,
                itemNode: (
                  <Image
                    height={200}
                    width={200}
                    quality={20}
                    key={picture}
                    src={getPictureSource(picture)}
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
