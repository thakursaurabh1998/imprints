import { Button, CircularProgress, Grid, Paper, TextField, Typography } from '@mui/material';
import { useFormik } from 'formik';
import { useEffect, useRef, useState } from 'react';

import PhotoManager, { PhotoManagerPictures } from '@/components/PhotoManager';
import { Collection } from '@/utils/collection-config';
import { runWithConcurrency } from '@/utils/upload-image';

export default function CollectionForm({
  collection,
  isLoading = false,
  onSubmit,
  onChange,
}: {
  collection: Collection;
  isLoading?: boolean;
  // eslint-disable-next-line no-unused-vars
  onSubmit: (collection: Collection) => void;
  // eslint-disable-next-line no-unused-vars
  onChange?: (collection: Collection) => void;
}) {
  const collectionForm = useFormik({
    initialValues: {
      title: collection.title,
      slug: collection.slug,
      description: collection.description,
    },
    onSubmit: () => {},
  });

  const [picturesState, setPicturesState] = useState<PhotoManagerPictures>({
    pictures: collection.pictures,
    cover: collection.cover,
  });

  const [publishing, setPublishing] = useState(false);
  const [deriveProgress, setDeriveProgress] = useState<{ done: number; total: number } | null>(null);

  const initialCollectionJSON = useRef(
    JSON.stringify({
      id: collection.id,
      title: collection.title,
      slug: collection.slug,
      description: collection.description,
      pictures: collection.pictures,
      cover: collection.cover,
    }),
  );

  const combined: Collection = {
    id: collection.id,
    title: collectionForm.values.title,
    slug: collectionForm.values.slug,
    description: collectionForm.values.description,
    pictures: picturesState.pictures,
    cover: picturesState.cover,
  };

  const hasChanges = JSON.stringify(combined) !== initialCollectionJSON.current;

  useEffect(() => {
    if (hasChanges) {
      onChange?.(combined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [combined.title, combined.slug, combined.description, combined.pictures, combined.cover]);

  async function handlePublish() {
    if (!combined.title || !combined.slug || !combined.description) {
      alert('Title, slug, and description are required.');
      return;
    }

    if (picturesState.pictures.length === 0) {
      alert('Add at least one picture before publishing.');
      return;
    }

    if (!picturesState.pictures.includes(picturesState.cover)) {
      alert('Pick a cover photo before publishing.');
      return;
    }

    setPublishing(true);
    setDeriveProgress({ done: 0, total: picturesState.pictures.length });

    const results = await runWithConcurrency(
      picturesState.pictures,
      4,
      async (filename) => {
        const res = await fetch(`/api/admin/${collection.id}/derive`, {
          method: 'POST',
          body: JSON.stringify({ filenames: [filename] }),
        });
        const data = await res.json();
        setDeriveProgress((prev) => (prev ? { done: prev.done + 1, total: prev.total } : prev));
        return data.results?.[0];
      },
    );

    await onSubmit(combined);

    setPublishing(false);
    setDeriveProgress(null);

    const skippedOriginalMissing = results.filter(
      (r) => r?.status === 'skipped' && r?.reason === 'original missing',
    );

    if (skippedOriginalMissing.length > 0) {
      alert(
        `Published — ${picturesState.pictures.length - skippedOriginalMissing.length} of ${picturesState.pictures.length} images generated. ${skippedOriginalMissing.length} skipped (original missing — legacy collection).`,
      );
    } else {
      alert(`Published — ${picturesState.pictures.length} images generated. Ready to commit.`);
    }
  }

  return (
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
            value={collectionForm.values.slug}
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
            value={collectionForm.values.description}
          />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Pictures
          </Typography>
          <PhotoManager
            collectionId={collection.id}
            slug={collectionForm.values.slug}
            initialPictures={collection.pictures}
            initialCover={collection.cover}
            onChange={setPicturesState}
          />
        </Grid>
        <Grid item xs={12}>
          <Button
            variant="contained"
            color="primary"
            disabled={isLoading || publishing || !hasChanges}
            onClick={handlePublish}
            endIcon={isLoading || publishing ? <CircularProgress size={15} /> : null}
          >
            {publishing && deriveProgress
              ? `Publishing ${deriveProgress.done} of ${deriveProgress.total}`
              : 'Publish'}
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
}
