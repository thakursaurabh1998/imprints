import { Box, Button, Typography } from '@mui/material';
import React, { useRef, useState } from 'react';

export default function Dropzone({
  onFilesSelected,
}: {
  // eslint-disable-next-line no-unused-vars
  onFilesSelected: (files: File[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  function handleFiles(fileList: FileList | null | undefined) {
    if (!fileList || fileList.length === 0) return;
    onFilesSelected(Array.from(fileList));
  }

  return (
    <Box
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragOver(false);
        handleFiles(e.dataTransfer.files);
      }}
      onPaste={(e) => handleFiles(e.clipboardData?.files)}
      sx={{
        border: '2px dashed',
        borderColor: isDragOver ? 'primary.main' : 'grey.400',
        borderRadius: 1,
        p: 3,
        textAlign: 'center',
        mb: 2,
      }}
    >
      <Typography variant="body2" sx={{ mb: 1 }}>
        Drag and drop photos here, paste, or
      </Typography>
      <Button variant="outlined" onClick={() => inputRef.current?.click()}>
        Browse
      </Button>
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
    </Box>
  );
}
