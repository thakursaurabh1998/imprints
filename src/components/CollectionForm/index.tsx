import { useFormik } from 'formik';
import { useEffect, useRef, useState } from 'react';

import PhotoManager, { PhotoManagerPictures } from '@/components/PhotoManager';
import { Button, Input, Textarea, useToast } from '@/components/ui';
import { ADMIN_API_URL } from '@/utils/admin-api';
import { Collection } from '@/utils/collection-config';
import { runWithConcurrency } from '@/utils/upload-image';
import styles from './CollectionForm.module.css';

const DERIVE_CONCURRENCY = 4;

const MIN_COLUMNS = 2;
const MAX_COLUMNS = 6;
const DEFAULT_COLUMNS = 4;

// Mirrors src/utils/publish-commit.ts's CommitAndPushResult, duplicated
// locally so this client component never imports that server-only module.
type CommitResult =
  | { status: 'nothing-to-commit'; branch: string }
  | {
      status: 'committed';
      branch: string;
      commitSha: string;
      reused: boolean;
      compareUrl: string | null;
    };

export default function CollectionForm({
  collection,
  baseline,
  isLoading = false,
  onSubmit,
  onChange,
  onUndo,
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
  /** Discards the draft and remounts this form fresh from `baseline`. */
  onUndo?: () => Promise<void>;
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

  const [committing, setCommitting] = useState(false);
  const [lastCommitResult, setLastCommitResult] = useState<CommitResult | null>(
    null,
  );

  const [undoArmed, setUndoArmed] = useState(false);
  const [undoing, setUndoing] = useState(false);
  const undoArmTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(undoArmTimeout.current), []);

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
    // A stale link from before this publish would point at content that no
    // longer matches what's on disk.
    setLastCommitResult(null);

    try {
      // Derive BEFORE writing the manifest, so a failure part-way can never
      // leave collections.json pointing at images that don't exist.
      const results = await runWithConcurrency(
        picturesState.pictures,
        DERIVE_CONCURRENCY,
        async (filename) => {
          const res = await fetch(
            `${ADMIN_API_URL}/api/admin/${collection.id}/derive`,
            {
              method: 'POST',
              body: JSON.stringify({ filenames: [filename] }),
            },
          );

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
          `Published — ${
            total - skipped.length
          } of ${total} images generated. ` +
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

  async function handleCommit() {
    setCommitting(true);

    try {
      const res = await fetch(
        `${ADMIN_API_URL}/api/admin/${collection.id}/commit`,
        { method: 'POST' },
      );

      if (!res.ok) throw new Error(await res.text());

      const data: CommitResult = await res.json();
      setLastCommitResult(data);

      if (data.status === 'nothing-to-commit') {
        toast.show(
          `Already up to date — nothing new on ${data.branch}.`,
          'info',
        );
      } else if (data.compareUrl) {
        toast.show(
          data.reused
            ? `Pushed another commit to ${data.branch}.`
            : `Pushed ${data.branch}. Ready to open a PR.`,
          'success',
        );
      } else {
        toast.show(
          `Pushed ${data.branch} — open a PR manually for that branch on GitHub (couldn't build a direct link).`,
          'warning',
        );
      }
    } catch (err) {
      toast.show(
        `Commit failed — ${
          err instanceof Error ? err.message : 'unknown error'
        }.`,
        'error',
      );
    }

    setCommitting(false);
  }

  async function handleUndoClick() {
    if (!undoArmed) {
      setUndoArmed(true);
      undoArmTimeout.current = setTimeout(() => setUndoArmed(false), 6000);
      return;
    }

    clearTimeout(undoArmTimeout.current);
    setUndoArmed(false);

    if (!onUndo) return;

    const removedSincePublish = (baseline ?? collection).pictures.filter(
      (filename) => !picturesState.pictures.includes(filename),
    );

    setUndoing(true);

    try {
      if (removedSincePublish.length > 0) {
        const res = await fetch(
          `${ADMIN_API_URL}/api/admin/${collection.id}/pictures/remove`,
          {
            method: 'POST',
            body: JSON.stringify({
              filenames: removedSincePublish,
              restore: true,
            }),
          },
        );

        if (!res.ok) throw new Error(await res.text());
      }

      await onUndo();
    } catch (err) {
      toast.show(
        `Could not undo changes — ${
          err instanceof Error ? err.message : 'unknown error'
        }`,
        'error',
      );
      setUndoing(false);
    }
  }

  const busy = isLoading || publishing || committing || undoing;

  return (
    <div className={styles.stack}>
      <div className={styles.columns}>
        <div className={styles.detailsCol}>
          <h2 className={styles.sectionTitle}>Details</h2>
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
        </div>

        <div className={styles.photosCol}>
          <div className={styles.photosHeader}>
            <h2 className={styles.sectionTitle}>Photos</h2>
            <ColumnsControl value={columns} onChange={setColumns} />
          </div>
          <div className={styles.photosBody}>
            <PhotoManager
              collectionId={collection.id}
              /*
               * The PUBLISHED slug, not the live form value.
               *
               * Preview URLs have to match where the server actually wrote the
               * files, and the upload route resolves its path from
               * collections.json on disk. Using the form value meant that editing
               * the slug (or a draft holding an unpublished one) pointed every
               * preview at a directory that doesn't exist — previews 404'd, and on
               * a new collection there are no committed thumbs to fall back to
               * either, so every tile rendered empty with just its alt text.
               */
              slug={(baseline ?? collection).slug}
              initialPictures={collection.pictures}
              initialCover={collection.cover}
              columns={columns}
              onChange={setPicturesState}
            />
          </div>
        </div>
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

          {onUndo && (
            <Button
              variant="danger"
              loading={undoing}
              disabled={busy}
              onClick={handleUndoClick}
            >
              {undoing
                ? 'Undoing'
                : undoArmed
                  ? 'Confirm undo?'
                  : 'Undo changes'}
            </Button>
          )}

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

      {!hasChanges && (
        <div className={styles.commitBar}>
          <div className={styles.publishText}>
            <span className={styles.publishTitle}>Version control</span>
            <span className={styles.publishHint}>
              Commits collections.json and the images for this collection to a
              collection/{combined.slug} branch, then pushes it to origin.
            </span>
          </div>

          <Button
            variant="secondary"
            loading={committing}
            disabled={busy}
            onClick={handleCommit}
          >
            {committing ? 'Committing' : 'Commit & push'}
          </Button>

          {lastCommitResult?.status === 'committed' &&
            lastCommitResult.compareUrl && (
              <Button
                variant="ghost"
                href={lastCommitResult.compareUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Create PR →
              </Button>
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
