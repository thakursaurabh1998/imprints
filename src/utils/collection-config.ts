import { readJSONFile, renameDirectory, writeJSONFile } from './file-system';

export type Collection = {
  id: string;
  title: string;
  description: string;
  slug: string;
  cover: string;
  pictures: string[];
};

const COLLECTION_JSON_FILE_PATH = './public/resource/collections.json';

export async function getCollections() {
  const collections: Collection[] = await readJSONFile(
    COLLECTION_JSON_FILE_PATH,
  );

  return collections;
}

export async function updateCollections(id: string, collection: Collection) {
  const collections = await getCollections();
  const collectionIndex = collections.findIndex((c) => c.id === id);
  collections[collectionIndex] = collection;

  return collections;
}

export async function updateCollectionsAndWriteToJson(
  id: string,
  collection: Collection,
) {
  const updatedCollections = await updateCollections(id, collection);
  await writeJSONFile(COLLECTION_JSON_FILE_PATH, updatedCollections);
}

export async function renameDirectoriesUsingSlug(
  oldSlug: string,
  newSlug: string,
) {
  const originalImagesPath = (slug: string) =>
    `./public/original/images/${slug}`;
  const thumbsImagesPath = (slug: string) => `./public/images/thumbs/${slug}`;
  const fullImagesPath = (slug: string) => `./public/images/full/${slug}`;

  await renameDirectory(
    originalImagesPath(oldSlug),
    originalImagesPath(newSlug),
  );

  await renameDirectory(thumbsImagesPath(oldSlug), thumbsImagesPath(newSlug));

  await renameDirectory(fullImagesPath(oldSlug), fullImagesPath(newSlug));
}
