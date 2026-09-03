import { useFormik } from 'formik';
import { useEffect, useRef, useState } from 'react';

import PhotoManager, { PhotoManagerPictures } from '@/components/PhotoManager';
import { Button, Input, Panel, Textarea, useToast } from '@/components/ui';
import { Collection } from '@/utils/collection-config';
import { runWithConcurrency } from '@/utils/upload-image';
import styles from './CollectionForm.module.css';

const DERIVE_CONCURRENCY = 4;

const MIN_COLUMNS = 2;
const MAX_COLUMNS = 6;
const DEFAULT_COLUMNS = 3;

export default function CollectionForm({
  collection,
  baseline,
  isLoading = false,
  onSubmit,
  onChange,
}: {
  /** Values to edit — the published collection with any draft overlaid. */
  collection: Collection;
  /**
   * The last *published* state, used purely for change detection. Without
   * this, reloading a page that has a draft on disk would baseline against
   * the draft itself, making `hasChanges` false and hiding the publish bar —
   * leaving no way to publish the draft short of making a throwaway edit.
   */
  baseline?: Collection;
  isLoading?: boolean;
  // eslint-disable-next-line no-unused-vars
  onSubmit: (collection: Collection) => void;
  // eslint-disable-next-line no-unused-vars
  onChange?: (collection: Collection) => void;
}) {
  const toast = useToast();

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

  const [columns, setColumns] = useState(DEFAULT_COLUMNS);

  const [publishing, setPublishing] = useState(false);
  const [deriveProgress, setDeriveProgress] = useState<{
    done: number;
    total: number;
  } | null>(null);

  const initialCollectionJSON = useRef(
    JSON.stringify(serialise(baseline ?? collection)),
  );

  const combined: Collection = {
    id: collection.id,
    title: collectionForm.values.title,
    slug: collectionForm.values.slug,
    description: collectionForm.values.description,
    pictures: picturesState.pictures,
    cover: picturesState.cover,
  };

  const hasChanges =
    JSON.stringify(serialise(combined)) !== initialCollectionJSON.current;

  useEffect(() => {
    if (hasChanges) {
      onChange?.(combined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    combined.title,
    combined.slug,
    combined.description,
    combined.pictures,
    combined.cover,
  ]);

  function validate(): string | null {
    if (!combined.title.trim()) return 'Add a title before publishing.';
    if (!combined.slug.trim()) return 'Add a slug before publishing.';
    if (!combined.description.trim()) {
      return 'Add a description before publishing.';
    }
    if (picturesState.pictures.length === 0) {
      return 'Add at least one photo before publishing.';
    }
    if (!picturesState.pictures.includes(picturesState.cover)) {
      return 'Pick a cover photo before publishing — hover a tile and press ★.';
    }
    return null;
  }

  async function handlePublish() {
    const problem = validate();

    if (problem) {
      toast.show(problem, 'warning');
      return;
    }

    const total = picturesState.pictures.length;

    setPublishing(true);
    setDeriveProgress({ done: 0, total });

    try {
      // Derive BEFORE writing the manifest, so a failure part-way can never
      // leave collections.json pointing at images that don't exist.
      const results = await runWithConcurrency(
        picturesState.pictures,
        DERIVE_CONCURRENCY,
        async (filename) => {
          const res = await fetch(`/api/admin/${collection.id}/derive`, {
            method: 'POST',
            body: JSON.stringify({ filenames: [filename] }),
          });

          if (!res.ok) throw new Error(await res.text());

          const data = await res.json();
          setDeriveProgress((prev) =>
            prev ? { done: prev.done + 1, total: prev.total } : prev,
          );
          return data.results?.[0];
        },
      );

      await onSubmit(combined);

      // Re-baseline, or `hasChanges` stays true and the publish bar keeps
      // claiming there are unpublished changes after a successful publish.
      initialCollectionJSON.current = JSON.stringify(serialise(combined));

      const skipped = results.filter(
        (r) => r?.status === 'skipped' && r?.reason === 'original missing',
      );

      if (skipped.length > 0) {
        toast.show(
          `Published — ${total - skipped.length} of ${total} images generated. ` +
            `${skipped.length} skipped because the original is missing (legacy collection). ` +
            `Ready to commit.`,
          'warning',
        );
      } else {
        toast.show(
          `Published — ${total} images generated. Ready to commit.`,
          'success',
        );
      }
    } catch (err) {
      toast.show(
        `Publish failed — ${
          err instanceof Error ? err.message : 'unknown error'
        }. collections.json was left unchanged; publish again to resume.`,
        'error',
      );
    }

    setPublishing(false);
    setDeriveProgress(null);
  }

  const busy = isLoading || publishing;

  return (
    <div className={styles.stack}>
      <div className={styles.columns}>
        <Panel title="Details" className={styles.detailsCol}>
          <div className={styles.grid}>
            <Input
              label="Title"
              id="title"
              name="title"
              onChange={collectionForm.handleChange}
              value={collectionForm.values.title}
            />
            <Input
              label="Slug"
              id="slug"
              name="slug"
              mono
              hint="URL and image folder name"
              onChange={collectionForm.handleChange}
              value={collectionForm.values.slug}
            />
            <div className={styles.full}>
              <Textarea
                label="Description"
                id="description"
                name="description"
                onChange={collectionForm.handleChange}
                value={collectionForm.values.description}
              />
            </div>
          </div>
        </Panel>

        <Panel
          title="Photos"
          className={styles.photosCol}
          actions={<ColumnsControl value={columns} onChange={setColumns} />}
        >
          <PhotoManager
            collectionId={collection.id}
            slug={collectionForm.values.slug}
            initialPictures={collection.pictures}
            initialCover={collection.cover}
            columns={columns}
            onChange={setPicturesState}
          />
        </Panel>
      </div>

      {hasChanges && (
        <div className={styles.publishBar}>
          <div className={styles.publishText}>
            <span className={styles.publishTitle}>
              {publishing && deriveProgress
                ? `Generating images — ${deriveProgress.done} of ${deriveProgress.total}`
                : 'Unpublished changes'}
            </span>
            <span className={styles.publishHint}>
              {publishing
                ? 'Writing collections.json once every image is generated'
                : 'Publishing generates the downsized images and saves collections.json'}
            </span>
          </div>

          <Button
            variant="primary"
            loading={busy}
            disabled={busy}
            onClick={handlePublish}
          >
            {publishing ? 'Publishing' : 'Publish'}
          </Button>

          {publishing && deriveProgress && deriveProgress.total > 0 && (
            <div className={styles.progressTrack}>
              <div
                className={styles.progressFill}
                style={{
                  width: `${
                    (deriveProgress.done / deriveProgress.total) * 100
                  }%`,
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ColumnsControl({
  value,
  onChange,
}: {
  value: number;
  // eslint-disable-next-line no-unused-vars
  onChange: (next: number) => void;
}) {
  return (
    <div className={styles.columnsControl}>
      <span className={styles.columnsLabel}>Columns</span>
      <Button
        size="icon"
        variant="ghost"
        disabled={value <= MIN_COLUMNS}
        onClick={() => onChange(Math.max(MIN_COLUMNS, value - 1))}
        aria-label="Fewer columns"
      >
        −
      </Button>
      <span className={styles.columnsValue}>{value}</span>
      <Button
        size="icon"
        variant="ghost"
        disabled={value >= MAX_COLUMNS}
        onClick={() => onChange(Math.min(MAX_COLUMNS, value + 1))}
        aria-label="More columns"
      >
        +
      </Button>
    </div>
  );
}

/** Stable key order, so change detection never trips on field ordering. */
function serialise(collection: Collection) {
  return {
    id: collection.id,
    title: collection.title,
    slug: collection.slug,
    description: collection.description,
    pictures: collection.pictures,
    cover: collection.cover,
  };
}
