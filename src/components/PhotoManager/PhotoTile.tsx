import React from 'react';

import { Spinner } from '@/components/ui';
import {
  getPreviewSource,
  getThumbsFallbackSource,
} from '@/utils/picture-source';
import styles from './PhotoTile.module.css';
import { PictureStatus } from './reducer';

type PhotoTileProps = {
  slug: string;
  filename: string;
  status: PictureStatus;
  error?: string;
  isCover: boolean;
  isSelected: boolean;
  // eslint-disable-next-line no-unused-vars
  onClick: (e: React.MouseEvent) => void;
  onRemove: () => void;
  onSetCover: () => void;
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
  onRemove,
  onSetCover,
  onRetry,
}: PhotoTileProps) {
  const isPending = status === 'queued' || status === 'uploading';
  const showImage = status === 'ready' || status === 'uploading';

  return (
    <div
      className={[
        styles.tile,
        isSelected && styles.selected,
        isCover && !isSelected && styles.isCover,
        isPending && styles.pending,
        status === 'failed' && styles.failed,
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      aria-label={filename}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(e as unknown as React.MouseEvent);
        }
      }}
    >
      {showImage ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          className={styles.image}
          src={getPreviewSource(slug, filename)}
          alt={filename}
          loading="lazy"
          draggable={false}
          onError={(e) => {
            const fallback = getThumbsFallbackSource(slug, filename);
            if (e.currentTarget.src.endsWith(fallback)) return;
            e.currentTarget.src = fallback;
          }}
        />
      ) : (
        <div className={styles.placeholder}>
          {status === 'failed' ? (
            <>
              <span className={styles.errorText}>{error || 'Upload failed'}</span>
              {onRetry && (
                <button
                  type="button"
                  className={styles.action}
                  style={{ width: 'auto', padding: '0 8px', fontSize: 10.5 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onRetry();
                  }}
                >
                  Retry
                </button>
              )}
            </>
          ) : (
            <>
              <Spinner size={13} />
              <span className={styles.placeholderName}>{filename}</span>
            </>
          )}
        </div>
      )}

      {status === 'uploading' && (
        <div className={styles.scrim}>
          <Spinner size={13} />
          Uploading
        </div>
      )}

      {/* Hover actions. Stop propagation so they don't toggle selection. */}
      {status === 'ready' && (
        <div className={styles.actions}>
          {!isCover && (
            <button
              type="button"
              className={`${styles.action} ${styles.actionCover}`}
              title="Set as cover"
              aria-label={`Set ${filename} as cover`}
              onClick={(e) => {
                e.stopPropagation();
                onSetCover();
              }}
            >
              ★
            </button>
          )}
          <button
            type="button"
            className={`${styles.action} ${styles.actionRemove}`}
            title="Remove"
            aria-label={`Remove ${filename}`}
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
          >
            ✕
          </button>
        </div>
      )}

      {isCover && <span className={styles.coverBadge}>COVER</span>}
      {isSelected && (
        <span className={styles.check} aria-hidden="true">
          ✓
        </span>
      )}
    </div>
  );
}

export default React.memo(PhotoTileImpl);
