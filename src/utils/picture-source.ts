export function getPictureSource({
  createMode,
  picture,
  uploadedFiles,
  slug,
}: {
  picture: string;
  createMode: boolean;
  uploadedFiles: File[];
  slug: string;
}) {
  if (createMode) {
    const imageFile = uploadedFiles.find((x) => x.name === picture);

    if (!imageFile) return '';

    return URL.createObjectURL(imageFile);
  }

  return `/original/images/${slug}/${picture}`;
}
