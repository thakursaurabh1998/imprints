import { getPictureSource } from '@/utils/picture-source';
import { Drawer, Grid } from '@mui/material';
import Image from 'next/image';

export default function CoverSelectionDrawer({
  show,
  pictures,
  slug,
  uploadedFiles,
  createMode,
  onSelect,
}: {
  show: boolean;
  slug: string;
  pictures: string[];
  uploadedFiles: File[];
  createMode: boolean;
  // eslint-disable-next-line no-unused-vars
  onSelect: (image?: string) => void;
}) {
  return (
    <Drawer
      role="presentation"
      anchor="bottom"
      open={show}
      onClose={() => onSelect()}
    >
      <Grid container maxHeight="100vh" minHeight="50vw">
        {pictures.length === 0 && (
          <h2>Need to add some pictures to the collection first!</h2>
        )}
        {pictures.map((picture) => (
          <div
            key={picture}
            style={{ cursor: 'pointer' }}
            onClick={() => onSelect(picture)}
          >
            <Image
              height={200}
              width={200}
              quality={20}
              src={getPictureSource({
                picture,
                uploadedFiles,
                createMode,
                slug,
              })}
              alt={picture}
            />
          </div>
        ))}
      </Grid>
    </Drawer>
  );
}
