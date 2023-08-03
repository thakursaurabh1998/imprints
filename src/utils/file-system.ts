import fs from 'fs/promises';

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
