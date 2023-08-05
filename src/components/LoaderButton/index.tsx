import { Button, CircularProgress } from '@mui/material';
import React from 'react';

export default function LoaderButton({
  children,
  loading = false,
}: {
  children: React.ReactNode;
  loading: boolean;
}) {
  return (
    <Button
      type="submit"
      color="primary"
      variant="contained"
      disabled={loading}
      endIcon={loading ? <CircularProgress size={15} /> : null}
    >
      {children}
    </Button>
  );
}
