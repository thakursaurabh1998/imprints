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

export async function writeJSONFile(filePath: string, data: any) {
  const directoryPath = getDirectory(filePath);

  if (!(await directoryExists(directoryPath))) {
    await createDirectory(directoryPath);
  }

  const file = JSON.stringify(data, null, 2);
  return fs.writeFile(filePath, file);
}

export function renameDirectory(oldPath: string, newPath: string) {
  return fs.rename(oldPath, newPath);
}

export function fileExists(filePath: string) {
  return fs
    .access(filePath)
    .then(() => true)
    .catch(() => false);
}

export function readFileBuffer(filePath: string) {
  return fs.readFile(filePath);
}

export async function deleteFileIfExists(filePath: string) {
  if (await fileExists(filePath)) {
    await fs.unlink(filePath);
  }
}

export async function moveFileToDirectory({
  fromPath,
  toPath,
}: {
  fromPath: string;
  toPath: string;
}) {
  if (!(await fileExists(fromPath))) return false;

  const directoryPath = getDirectory(toPath);
  if (!(await directoryExists(directoryPath))) {
    await createDirectory(directoryPath);
  }

  await fs.rename(fromPath, toPath);
  return true;
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
