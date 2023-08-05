import fs from 'fs/promises';
import path from 'path';

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

export async function writeFileToDirectory({
  filePath,
  buffer,
}: {
  filePath: string;
  buffer: Buffer;
}) {
  const directoryPath = getDirectory(filePath);
  const isDirectoryPresent = await directoryExists(directoryPath);

  if (!isDirectoryPresent) {
    await createDirectory(directoryPath);
  }

  return fs.writeFile(filePath, buffer);
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
