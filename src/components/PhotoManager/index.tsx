import React, {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';

import SortableGrid from '@/components/SortableGrid';
import { Badge, Button, Toolbar, useToast } from '@/components/ui';
import { ADMIN_API_URL } from '@/utils/admin-api';
import { pushToUniqueList } from '@/utils/deduplicated-list';
import { runWithConcurrency, uploadImage } from '@/utils/upload-image';
import Dropzone from './Dropzone';
import PhotoTile from './PhotoTile';
import styles from './PhotoManager.module.css';
import {
  getReadyOrder,
  initialPhotoManagerState,
  photoManagerReducer,
} from './reducer';

const UPLOAD_CONCURRENCY = 4;

export type PhotoManagerPictures = { pictures: string[]; cover: string };

export default function PhotoManager({
  collectionId,
  slug,
  initialPictures,
  initialCover,
  columns,
  onChange,
}: {
  collectionId: string;
  slug: string;
  initialPictures: string[];
  initialCover: string;
  columns: number;
  // eslint-disable-next-line no-unused-vars
  onChange: (pictures: PhotoManagerPictures) => void;
}) {
  const [state, dispatch] = useReducer(photoManagerReducer, undefined, () =>
    initialPhotoManagerState(initialPictures, initialCover),
  );

  const toast = useToast();
  const queuedFilesRef = useRef<Map<string, File>>(new Map());

  const lastReportedJSON = useRef(
    JSON.stringify({ pictures: initialPictures, cover: initialCover }),
  );

  useEffect(() => {
    const readyOrder = getReadyOrder(state);
    const current = JSON.stringify({
      pictures: readyOrder,
      cover: state.cover,
    });

    if (current !== lastReportedJSON.current) {
      lastReportedJSON.current = current;
      onChange({ pictures: readyOrder, cover: state.cover });
    }
  });

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') dispatch({ type: 'clearSelection' });
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const uploadOne = useCallback(
    async (file: File) => {
      dispatch({ type: 'markUploading', filename: file.name });

      try {
        const { filename } = await uploadImage(
          `${ADMIN_API_URL}/api/admin/${collectionId}/upload`,
          { arg: file },
        );
        dispatch({ type: 'markReady', filename });
      } catch (err) {
        dispatch({
          type: 'markFailed',
          filename: file.name,
          error: err instanceof Error ? err.message : 'Upload failed',
        });
      }
    },
    [collectionId],
  );

  const handleFilesSelected = useCallback(
    (files: File[]) => {
      const { duplicates } = pushToUniqueList(
        state.order,
        files.map((f) => f.name),
      );
      const newFiles = files.filter(
        (file) => !duplicates.includes(file.name),
      );

      if (duplicates.length > 0) {
        toast.show(
          `Skipped ${duplicates.length} photo${
            duplicates.length > 1 ? 's' : ''
          } already in this collection: ${duplicates.join(', ')}`,
          'warning',
        );
      }

      if (newFiles.length === 0) return;

      for (const file of newFiles) {
        queuedFilesRef.current.set(file.name, file);
      }

      dispatch({ type: 'queue', filenames: newFiles.map((f) => f.name) });
      runWithConcurrency(newFiles, UPLOAD_CONCURRENCY, uploadOne);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.order, uploadOne, toast],
  );

  const removePictures = useCallback(
    async (filenames: string[]) => {
      if (filenames.length === 0) return;

      try {
        const res = await fetch(
          `${ADMIN_API_URL}/api/admin/${collectionId}/pictures/remove`,
          { method: 'POST', body: JSON.stringify({ filenames }) },
        );

        if (!res.ok) throw new Error(await res.text());

        dispatch({ type: 'remove', filenames });
      } catch (err) {
        toast.show(
          `Could not remove ${filenames.length > 1 ? 'photos' : 'photo'} — ${
            err instanceof Error ? err.message : 'unknown error'
          }`,
          'error',
        );
      }
    },
    [collectionId, toast],
  );

  const handleUndo = useCallback(async () => {
    const filenames = state.lastRemoved.map((r) => r.filename);
    if (filenames.length === 0) return;

    try {
      const res = await fetch(
        `${ADMIN_API_URL}/api/admin/${collectionId}/pictures/remove`,
        {
          method: 'POST',
          body: JSON.stringify({ filenames, restore: true }),
        },
      );

      if (!res.ok) throw new Error(await res.text());

      dispatch({ type: 'undoRemove' });
    } catch (err) {
      toast.show(
        `Could not restore — ${
          err instanceof Error ? err.message : 'unknown error'
        }`,
        'error',
      );
    }
  }, [collectionId, state.lastRemoved, toast]);

  const handleRetry = useCallback(
    (filename: string) => {
      const file = queuedFilesRef.current.get(filename);
      if (file) uploadOne(file);
    },
    [uploadOne],
  );

  const handleTileClick = useCallback(
    (filename: string, e: React.MouseEvent) => {
      dispatch({ type: 'select', filename, range: e.shiftKey });
    },
    [],
  );

  const handleSetCover = useCallback((filename: string) => {
    dispatch({ type: 'setCover', filename });
  }, []);

  const items = useMemo(
    () =>
      state.order.map((filename) => {
        const item = state.items[filename];

        return {
          id: filename,
          itemNode: (
            <PhotoTile
              slug={slug}
              filename={filename}
              status={item.status}
              error={item.error}
              isCover={state.cover === filename}
              isSelected={state.selected.includes(filename)}
              onClick={(e) => handleTileClick(filename, e)}
              onRemove={() => removePictures([filename])}
              onSetCover={() => handleSetCover(filename)}
              onRetry={
                item.status === 'failed'
                  ? () => handleRetry(filename)
                  : undefined
              }
            />
          ),
        };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      state.order,
      state.items,
      state.cover,
      state.selected,
      slug,
      handleTileClick,
      handleSetCover,
      removePictures,
      handleRetry,
    ],
  );

  const statuses = state.order.map((f) => state.items[f]?.status);
  const readyCount = statuses.filter((s) => s === 'ready').length;
  const pendingCount = statuses.filter(
    (s) => s === 'queued' || s === 'uploading',
  ).length;
  const failedCount = statuses.filter((s) => s === 'failed').length;

  const selectedReady = state.selected.filter(
    (f) => state.items[f]?.status === 'ready',
  );

  return (
    <>
      <Dropzone
        compact={state.order.length > 0}
        onFilesSelected={handleFilesSelected}
      />

      <div className={styles.statusBar}>
        <div className={styles.counts}>
          <Badge tone={readyCount > 0 ? 'success' : 'neutral'}>
            {readyCount} ready
          </Badge>
          {pendingCount > 0 && <Badge tone="accent" dot>{pendingCount} uploading</Badge>}
          {failedCount > 0 && <Badge tone="danger">{failedCount} failed</Badge>}
        </div>

        <span className={styles.spacer} />

        {state.order.length > 0 && (
          <span className={styles.selectHint}>
            Click to select · shift-click for a range · drag ⠿ to reorder
          </span>
        )}
      </div>

      {state.order.length === 0 ? (
        <p className={styles.empty}>
          No photos yet — drop some in above.
        </p>
      ) : (
        <SortableGrid
          items={items}
          columns={columns}
          onChange={(updated) =>
            dispatch({
              type: 'reorder',
              order: updated.map((item) => item.id as string),
            })
          }
        />
      )}

      {(state.selected.length > 0 || state.lastRemoved.length > 0) && (
        <FloatingActions
          selectedCount={state.selected.length}
          canSetCover={selectedReady.length === 1}
          undoCount={state.lastRemoved.length}
          onRemove={() => removePictures(state.selected)}
          onSetCover={() => handleSetCover(selectedReady[0])}
          onClear={() => dispatch({ type: 'clearSelection' })}
          onUndo={handleUndo}
        />
      )}
    </>
  );
}

function FloatingActions({
  selectedCount,
  canSetCover,
  undoCount,
  onRemove,
  onSetCover,
  onClear,
  onUndo,
}: {
  selectedCount: number;
  canSetCover: boolean;
  undoCount: number;
  onRemove: () => void;
  onSetCover: () => void;
  onClear: () => void;
  onUndo: () => void;
}) {
  if (selectedCount > 0) {
    return (
      <Toolbar label={`${selectedCount} selected`}>
        {canSetCover && (
          <Button size="sm" onClick={onSetCover}>
            ★ Set as cover
          </Button>
        )}
        <Button size="sm" variant="danger" onClick={onRemove}>
          Remove {selectedCount}
        </Button>
        <Button size="sm" variant="ghost" onClick={onClear}>
          Clear
        </Button>
      </Toolbar>
    );
  }

  return (
    <Toolbar
      label={`Removed ${undoCount} photo${undoCount > 1 ? 's' : ''}`}
    >
      <Button size="sm" onClick={onUndo}>
        Undo
      </Button>
    </Toolbar>
  );
}
