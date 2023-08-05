import {
  FULL_IMAGE_DIRECTORY,
  ORIGINAL_IMAGE_DIRECTORY,
  THUMBS_IMAGE_DIRECTORY,
} from './constants';
import { writeFileToDirectory } from './file-system';
import { getFullImageBuffer, getThumbsImageBuffer } from './image-optimisation';

export async function saveAllImageVariations({
  buffer,
  relativeFilePath,
}: {
  buffer: Buffer;
  relativeFilePath: string;
}) {
  return Promise.all([
    writeFileToDirectory({
      filePath: `${ORIGINAL_IMAGE_DIRECTORY}/${relativeFilePath}`,
      buffer,
    }),
    writeFileToDirectory({
      filePath: `${THUMBS_IMAGE_DIRECTORY}/${relativeFilePath}`,
      buffer: await getThumbsImageBuffer(buffer),
    }),
    writeFileToDirectory({
      filePath: `${FULL_IMAGE_DIRECTORY}/${relativeFilePath}`,
      buffer: await getFullImageBuffer(buffer),
    }),
  ]);
}
