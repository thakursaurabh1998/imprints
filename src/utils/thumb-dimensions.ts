import { open } from 'fs/promises';
import path from 'path';

import { THUMBS_IMAGE_DIRECTORY } from './constants';

export type ImageDimensions = { width: number; height: number };

/*
 * Reads the pixel dimensions of committed thumbs so the grid can reserve exact
 * space for every photo before it downloads. Server-only: it touches the
 * filesystem, and is called from the prerendered collection/home pages.
 *
 * Why a hand-rolled JPEG header read rather than sharp, which is already a
 * dependency? Nothing in the Next build imports sharp today — it is only
 * reached by the dev-only admin server (image-optimisation.ts -> save-image.ts
 * -> server/). Importing it from a server component would make the *public*
 * production deploy newly depend on a native module that is pinned at 0.32.4,
 * ships no binaries in its tarball, and fetches its binding through a
 * `prebuild-install` postinstall — which npm's install-script allowlist blocks
 * outright (this checkout has only a darwin-arm64 binding on disk). A Pages
 * deploy that stops building because a 2023 native module failed to download
 * is a worse trade than the parse below.
 *
 * Keeping the parse this narrow is safe because every file it reads is written
 * by our own pipeline: `getFullAndThumbsImageBuffers` emits JPEG via sharp, and
 * all 526 committed thumbs are baseline JPEG carrying no EXIF orientation tag
 * (sharp's `.rotate()` bakes rotation in and drops the tag). So the SOF frame
 * header holds the dimensions the browser will actually lay out — which is the
 * whole point: dimensions that disagree with the served file make the browser
 * swap our attribute ratio for the real intrinsic one on load and shift anyway.
 */

/*
 * The frame header sits behind the APPn/DQT segments. A single APP1/EXIF
 * segment is capped at ~64KB, so 128KB clears the realistic worst case without
 * pulling ~230KB of scan data per file off disk (525 files, every build).
 */
const HEADER_CHUNK_BYTES = 128 * 1024;

/*
 * SOF0-3, SOF5-7, SOF9-11, SOF13-15. The 0xC0-0xCF range also holds DHT
 * (0xC4), JPG (0xC8) and DAC (0xCC), which are not frame headers.
 */
function isStartOfFrame(marker: number) {
  if (marker < 0xc0 || marker > 0xcf) return false;
  return marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
}

function parseJpegDimensions(buffer: Buffer): ImageDimensions | null {
  // SOI.
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) return null;

  let offset = 2;

  while (offset + 3 < buffer.length) {
    // Segments are 0xFF-prefixed; anything else is fill and gets skipped.
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }

    const marker = buffer[offset + 1];

    // Standalone markers carry no length field.
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      offset += 2;
      continue;
    }

    // Start of scan or end of image: entropy-coded data follows, no more headers.
    if (marker === 0xda || marker === 0xd9) return null;

    if (isStartOfFrame(marker)) {
      // Payload is precision(1) height(2) width(2) after the 2-byte length.
      if (offset + 9 > buffer.length) return null;

      const height = buffer.readUInt16BE(offset + 5);
      const width = buffer.readUInt16BE(offset + 7);

      return width > 0 && height > 0 ? { width, height } : null;
    }

    offset += 2 + buffer.readUInt16BE(offset + 2);
  }

  return null;
}

async function readThumbDimensions(filePath: string) {
  const handle = await open(filePath, 'r');

  try {
    const buffer = Buffer.alloc(HEADER_CHUNK_BYTES);
    const { bytesRead } = await handle.read(buffer, 0, HEADER_CHUNK_BYTES, 0);

    return parseJpegDimensions(buffer.subarray(0, bytesRead));
  } finally {
    await handle.close();
  }
}

/*
 * Returns null for a missing or unreadable thumb rather than throwing: callers
 * then omit the width/height attributes and the image behaves exactly as it did
 * before this existed. A malformed file should not fail the whole build.
 */
export async function getThumbDimensions(
  slug: string,
  filename: string,
): Promise<ImageDimensions | null> {
  try {
    return await readThumbDimensions(
      path.resolve(THUMBS_IMAGE_DIRECTORY, slug, filename),
    );
  } catch {
    return null;
  }
}

export type ThumbDimensionsMap = Record<string, ImageDimensions>;

/*
 * Keyed by filename, not array index — PhotoGrid already uses the filename as
 * its React key, and a map cannot silently misalign the way a parallel array
 * can. Unreadable entries are left out, so a lookup miss is the degraded path.
 */
export async function getThumbDimensionsMap(
  slug: string,
  filenames: string[],
): Promise<ThumbDimensionsMap> {
  const entries = await Promise.all(
    filenames.map(
      async (filename) =>
        [filename, await getThumbDimensions(slug, filename)] as const,
    ),
  );

  return Object.fromEntries(
    entries.filter(
      (entry): entry is [string, ImageDimensions] => entry[1] !== null,
    ),
  );
}
