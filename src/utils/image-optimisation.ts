import sharp from 'sharp';

const FULL_IMAGE_WIDTH = 2048;
const THUMBS_IMAGE_WIDTH = 1024;
const PREVIEW_IMAGE_WIDTH = 320;

export async function getFullAndThumbsImageBuffers(imageBuffer: Buffer) {
  const pipeline = sharp(imageBuffer).rotate();

  const [full, thumbs] = await Promise.all([
    pipeline
      .clone()
      .resize({ width: FULL_IMAGE_WIDTH, withoutEnlargement: true })
      .toBuffer(),
    pipeline
      .clone()
      .resize({ width: THUMBS_IMAGE_WIDTH, withoutEnlargement: true })
      .toBuffer(),
  ]);

  return { full, thumbs };
}

export function getPreviewImageBuffer(imageBuffer: Buffer) {
  return sharp(imageBuffer)
    .rotate()
    .resize({ width: PREVIEW_IMAGE_WIDTH, withoutEnlargement: true })
    .toBuffer();
}
