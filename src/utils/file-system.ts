import fs from 'fs/promises';
import path from 'path';
import { ORIGINAL_IMAGE_DIRECTORY } from './constants';

const EXCLUDED_FILES = ['.DS_Store'];

export async function getContentsOfDirectory(directoryPath: string) {
  const files = await fs.readdir(directoryPath);
  return files.filter((file) => !EXCLUDED_FILES.includes(file));
}

export async function readJSONFile(filePath: string) {
  const file = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(file);
}

export function writeJSONFile(filePath: string, data: any) {
  const file = JSON.stringify(data, null, 2);
  return fs.writeFile(filePath, file);
}

export function renameDirectory(oldPath: string, newPath: string) {
  return fs.rename(oldPath, newPath);
}

export async function writeOriginalImage({
  filePath,
  buffer,
}: {
  filePath: string;
  buffer: Buffer;
}) {
  const imagePath = `${ORIGINAL_IMAGE_DIRECTORY}/${filePath}`;
  const directoryPath = getDirectory(imagePath);

  const isDirectoryPresent = await directoryExists(directoryPath);

  if (!isDirectoryPresent) {
    await createDirectory(directoryPath);
  }

  return fs.writeFile(imagePath, buffer);
}

function getDirectory(filePath: string) {
  return path.parse(filePath).dir;
}

function createDirectory(directoryPath: string) {
  return fs.mkdir(directoryPath, { recursive: true });
}

function directoryExists(directoryPath: string) {
  return fs
    .access(directoryPath)
    .then(() => true)
    .catch(() => false);
}
