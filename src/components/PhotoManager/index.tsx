import { Alert, Box, Button, Stack, Typography } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';

import SortableGrid from '@/components/SortableGrid';
import { pushToUniqueList } from '@/utils/deduplicated-list';
import { runWithConcurrency, uploadImage } from '@/utils/upload-image';
import Dropzone from './Dropzone';
import PhotoTile from './PhotoTile';
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
  onChange,
}: {
  collectionId: string;
  slug: string;
  initialPictures: string[];
  initialCover: string;
  // eslint-disable-next-line no-unused-vars
  onChange: (pictures: PhotoManagerPictures) => void;
}) {
  const [state, dispatch] = useReducer(
    photoManagerReducer,
    undefined,
    () => initialPhotoManagerState(initialPictures, initialCover),
  );

  const queuedFilesRef = useRef<Map<string, File>>(new Map());
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  const lastReportedJSON = useRef(
    JSON.stringify({ pictures: initialPictures, cover: initialCover }),
  );

  useEffect(() => {
    const readyOrder = getReadyOrder(state);
    const current = JSON.stringify({ pictures: readyOrder, cover: state.cover });

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
          `/api/admin/${collectionId}/upload`,
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
      const { duplicates } = pushToUniqueList(state.order, files.map((f) => f.name));
      const newFiles = files.filter((file) => !duplicates.includes(file.name));

      setDuplicateWarning(
        duplicates.length > 0
          ? `Skipped ${duplicates.length} duplicate filename${
              duplicates.length > 1 ? 's' : ''
            }: ${duplicates.join(', ')}`
          : null,
      );

      if (newFiles.length === 0) return;

      for (const file of newFiles) queuedFilesRef.current.set(file.name, file);

      dispatch({ type: 'queue', filenames: newFiles.map((f) => f.name) });
      runWithConcurrency(newFiles, UPLOAD_CONCURRENCY, uploadOne);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.order, uploadOne],
  );

  function handleRetry(filename: string) {
    const file = queuedFilesRef.current.get(filename);
    if (file) uploadOne(file);
  }

  const handleTileClick = useCallback((filename: string, e: React.MouseEvent) => {
    dispatch({ type: 'select', filename, range: e.shiftKey });
  }, []);

  async function handleRemoveSelected() {
    const filenames = state.selected;
    if (filenames.length === 0) return;

    const res = await fetch(`/api/admin/${collectionId}/pictures/remove`, {
      method: 'POST',
      body: JSON.stringify({ filenames }),
    });

    if (!res.ok) {
      alert('Failed to remove selected photos.');
      return;
    }

    dispatch({ type: 'removeSelected' });
  }

  async function handleUndo() {
    const filenames = state.lastRemoved.map((r) => r.filename);
    if (filenames.length === 0) return;

    const res = await fetch(`/api/admin/${collectionId}/pictures/remove`, {
      method: 'POST',
      body: JSON.stringify({ filenames, restore: true }),
    });

    if (!res.ok) {
      alert('Failed to restore photos.');
      return;
    }

    dispatch({ type: 'undoRemove' });
  }

  function handleSetCover() {
    if (state.selected.length !== 1) return;
    dispatch({ type: 'setCover', filename: state.selected[0] });
  }

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
              onRetry={item.status === 'failed' ? () => handleRetry(filename) : undefined}
            />
          ),
        };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.order, state.items, state.cover, state.selected, slug, handleTileClick],
  );

  const readyCount = getReadyOrder(state).length;
  const canSetCover =
    state.selected.length === 1 &&
    state.items[state.selected[0]]?.status === 'ready';

  return (
    <Box>
      <Dropzone onFilesSelected={handleFilesSelected} />

      {duplicateWarning && (
        <Alert severity="warning" sx={{ mb: 2 }} onClose={() => setDuplicateWarning(null)}>
          {duplicateWarning}
        </Alert>
      )}

      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="body2">
          {readyCount} of {state.order.length} ready
        </Typography>
        {state.selected.length > 0 && (
          <>
            <Button size="small" color="error" variant="outlined" onClick={handleRemoveSelected}>
              Remove {state.selected.length} selected
            </Button>
            {canSetCover && (
              <Button size="small" variant="outlined" onClick={handleSetCover}>
                Set as cover
              </Button>
            )}
          </>
        )}
        {state.lastRemoved.length > 0 && (
          <Button size="small" onClick={handleUndo}>
            Undo remove ({state.lastRemoved.length})
          </Button>
        )}
      </Stack>

      <SortableGrid
        items={items}
        onChange={(updated) =>
          dispatch({ type: 'reorder', order: updated.map((item) => item.id as string) })
        }
      />
    </Box>
  );
}
