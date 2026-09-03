import {
  FULL_IMAGE_DIRECTORY,
  ORIGINAL_IMAGE_DIRECTORY,
  PREVIEW_IMAGE_DIRECTORY,
  THUMBS_IMAGE_DIRECTORY,
} from './constants';
import {
  deleteFileIfExists,
  fileExists,
  readFileBuffer,
  writeFileToDirectory,
} from './file-system';
import {
  getFullAndThumbsImageBuffers,
  getPreviewImageBuffer,
} from './image-optimisation';

export async function saveUploadedImage({
  buffer,
  relativeFilePath,
}: {
  buffer: Buffer;
  relativeFilePath: string;
}) {
  const previewBuffer = await getPreviewImageBuffer(buffer);

  await Promise.all([
    writeFileToDirectory({
      filePath: `${ORIGINAL_IMAGE_DIRECTORY}/${relativeFilePath}`,
      buffer,
    }),
    writeFileToDirectory({
      filePath: `${PREVIEW_IMAGE_DIRECTORY}/${relativeFilePath}`,
      buffer: previewBuffer,
    }),
  ]);
}

export async function deleteUploadedImage({
  relativeFilePath,
}: {
  relativeFilePath: string;
}) {
  await Promise.all([
    deleteFileIfExists(`${ORIGINAL_IMAGE_DIRECTORY}/${relativeFilePath}`),
    deleteFileIfExists(`${PREVIEW_IMAGE_DIRECTORY}/${relativeFilePath}`),
  ]);
}

export function originalImageExists({
  relativeFilePath,
}: {
  relativeFilePath: string;
}) {
  return fileExists(`${ORIGINAL_IMAGE_DIRECTORY}/${relativeFilePath}`);
}

export async function derivativesExist({
  relativeFilePath,
}: {
  relativeFilePath: string;
}) {
  const [thumbsExists, fullExists] = await Promise.all([
    fileExists(`${THUMBS_IMAGE_DIRECTORY}/${relativeFilePath}`),
    fileExists(`${FULL_IMAGE_DIRECTORY}/${relativeFilePath}`),
  ]);

  return thumbsExists && fullExists;
}

export async function saveDerivatives({
  relativeFilePath,
}: {
  relativeFilePath: string;
}) {
  const buffer = await readFileBuffer(
    `${ORIGINAL_IMAGE_DIRECTORY}/${relativeFilePath}`,
  );
  const { full, thumbs } = await getFullAndThumbsImageBuffers(buffer);

  await Promise.all([
    writeFileToDirectory({
      filePath: `${THUMBS_IMAGE_DIRECTORY}/${relativeFilePath}`,
      buffer: thumbs,
    }),
    writeFileToDirectory({
      filePath: `${FULL_IMAGE_DIRECTORY}/${relativeFilePath}`,
      buffer: full,
    }),
  ]);
}
