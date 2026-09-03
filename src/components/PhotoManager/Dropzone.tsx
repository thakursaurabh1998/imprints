import React, { useRef, useState } from 'react';

import { Button } from '@/components/ui';
import styles from './Dropzone.module.css';

export default function Dropzone({
  compact = false,
  onFilesSelected,
}: {
  compact?: boolean;
  // eslint-disable-next-line no-unused-vars
  onFilesSelected: (files: File[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  // dragenter/dragleave fire for every child element, so a boolean flag
  // flickers. Counting entries against exits is the reliable version.
  const dragDepth = useRef(0);

  function handleFiles(fileList: FileList | null | undefined) {
    if (!fileList || fileList.length === 0) return;

    const images = Array.from(fileList).filter(
      (file) => file.type.startsWith('image/') || file.type === '',
    );

    if (images.length > 0) onFilesSelected(images);
  }

  return (
    <div
      className={[
        styles.zone,
        compact && styles.compact,
        isDragOver && styles.dragOver,
      ]
        .filter(Boolean)
        .join(' ')}
      onDragEnter={(e) => {
        e.preventDefault();
        dragDepth.current += 1;
        setIsDragOver(true);
      }}
      onDragOver={(e) => e.preventDefault()}
      onDragLeave={() => {
        dragDepth.current -= 1;
        if (dragDepth.current <= 0) {
          dragDepth.current = 0;
          setIsDragOver(false);
        }
      }}
      onDrop={(e) => {
        e.preventDefault();
        dragDepth.current = 0;
        setIsDragOver(false);
        handleFiles(e.dataTransfer.files);
      }}
      onPaste={(e) => handleFiles(e.clipboardData?.files)}
    >
      {!compact && (
        <span className={styles.icon} aria-hidden="true">
          ⤓
        </span>
      )}
      <span className={styles.text}>
        {isDragOver ? 'Drop to upload' : 'Drag photos here, or paste'}
      </span>
      <Button size="sm" onClick={() => inputRef.current?.click()}>
        Browse
      </Button>
      {!compact && (
        <span className={styles.hint}>
          Uploads start immediately — you can reorder while they run
        </span>
      )}
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*"
        hidden
        onChange={(e) => {
          handleFiles(e.target.files);
          // Reset so picking the same file again isn't a silent no-op.
          e.target.value = '';
        }}
      />
    </div>
  );
}
