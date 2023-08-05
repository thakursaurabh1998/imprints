import sharp from 'sharp';

function getCompressedImageBuffer(imageBuffer: Buffer, size: number) {
  return sharp(imageBuffer).rotate().resize({ width: size }).toBuffer();
}

export function getFullImageBuffer(imageBuffer: Buffer) {
  const FULL_IMAGE_WIDTH = 2048;
  return getCompressedImageBuffer(imageBuffer, FULL_IMAGE_WIDTH);
}

export function getThumbsImageBuffer(imageBuffer: Buffer) {
  const FULL_IMAGE_WIDTH = 1024;
  return getCompressedImageBuffer(imageBuffer, FULL_IMAGE_WIDTH);
}
