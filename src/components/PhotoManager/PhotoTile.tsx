import { Box } from '@mui/material';
import React from 'react';

import { getPreviewSource, getThumbsFallbackSource } from '@/utils/picture-source';
import { PictureStatus } from './reducer';

const TILE_SIZE = 200;

type PhotoTileProps = {
  slug: string;
  filename: string;
  status: PictureStatus;
  error?: string;
  isCover: boolean;
  isSelected: boolean;
  // eslint-disable-next-line no-unused-vars
  onClick: (e: React.MouseEvent) => void;
  onRetry?: () => void;
};

function PhotoTileImpl({
  slug,
  filename,
  status,
  error,
  isCover,
  isSelected,
  onClick,
  onRetry,
}: PhotoTileProps) {
  return (
    <Box
      onClick={onClick}
      sx={{
        width: TILE_SIZE,
        height: TILE_SIZE,
        position: 'relative',
        boxSizing: 'border-box',
        cursor: 'pointer',
        overflow: 'hidden',
        bgcolor: '#eee',
        border: isSelected
          ? '3px solid #1976d2'
          : isCover
            ? '3px solid #f5a623'
            : '1px solid #ccc',
        opacity: status === 'queued' || status === 'uploading' ? 0.6 : 1,
      }}
    >
      {status === 'ready' || status === 'uploading' ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={getPreviewSource(slug, filename)}
          width={TILE_SIZE}
          height={TILE_SIZE}
          loading="lazy"
          alt={filename}
          draggable={false}
          style={{ objectFit: 'cover', width: '100%', height: '100%' }}
          onError={(e) => {
            const fallback = getThumbsFallbackSource(slug, filename);
            if (e.currentTarget.src.endsWith(fallback)) return;
            e.currentTarget.src = fallback;
          }}
        />
      ) : (
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            textAlign: 'center',
            p: 1,
          }}
        >
          {status === 'failed' ? error || 'Failed' : 'Queued…'}
        </Box>
      )}

      {status === 'uploading' && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            bgcolor: 'rgba(0,0,0,0.35)',
            color: '#fff',
          }}
        >
          Uploading…
        </Box>
      )}

      {isCover && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 4,
            right: 4,
            bgcolor: '#f5a623',
            color: '#000',
            fontSize: 10,
            fontWeight: 700,
            px: 0.5,
            borderRadius: 0.5,
          }}
        >
          COVER
        </Box>
      )}

      {status === 'failed' && onRetry && (
        <Box
          onClick={(e) => {
            e.stopPropagation();
            onRetry();
          }}
          sx={{
            position: 'absolute',
            bottom: 4,
            left: 4,
            bgcolor: '#d32f2f',
            color: '#fff',
            fontSize: 10,
            fontWeight: 700,
            px: 0.5,
            borderRadius: 0.5,
          }}
        >
          RETRY
        </Box>
      )}
    </Box>
  );
}

export default React.memo(PhotoTileImpl);
