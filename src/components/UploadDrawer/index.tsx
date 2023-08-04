import { Button, CircularProgress, Drawer, Grid } from '@mui/material';
import { useRef, useState } from 'react';
import useSWRMutation from 'swr/mutation';

export default function UploadDrawer({
  show,
  collectionId,
  handleClose,
}: {
  show: boolean;
  collectionId: string | null;
  // eslint-disable-next-line no-unused-vars
  handleClose: (uploadedImages?: File[]) => void;
}) {
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { trigger } = useSWRMutation(
    `/api/admin/${collectionId}/upload`,
    uploadImage,
  );

  return (
    <Drawer
      role="presentation"
      anchor="bottom"
      open={show}
      onClose={() => handleClose()}
    >
      <Grid
        container
        minHeight="50vh"
        maxHeight="50vh"
        alignContent="center"
        justifyContent="center"
      >
        {loading ? (
          <CircularProgress />
        ) : (
          <Button
            size="large"
            variant="outlined"
            onClick={() => fileInputRef.current?.click()}
          >
            Upload
          </Button>
        )}
        <input
          hidden
          multiple
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={async (e) => {
            setLoading(true);

            const files = Object.values(e.target.files ?? {});

            const pictures: string[] = [];

            for (const file of files) {
              pictures.push(file.name);
            }

            if (collectionId) {
              for (const file of files) {
                await trigger(file);
              }
              handleClose();
            } else {
              handleClose(Object.values(files));
            }
          }}
        />
      </Grid>
    </Drawer>
  );
}

function uploadImage(url: string, { arg: imageFile }: { arg: File }) {
  const formData = new FormData();

  formData.append('file', imageFile);

  return fetch(url, {
    method: 'POST',
    body: formData,
  });
}
