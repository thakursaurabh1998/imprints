import {
  FULL_IMAGE_DIRECTORY,
  ORIGINAL_IMAGE_DIRECTORY,
  PREVIEW_IMAGE_DIRECTORY,
  THUMBS_IMAGE_DIRECTORY,
} from './constants';
import {
  directoryExists,
  readJSONFile,
  renameDirectory,
  writeJSONFile,
} from './file-system';

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

export async function getCollectionById(id: string) {
  const collections = await getCollections();
  return collections.find((c) => c.id === id) ?? null;
}

export async function updateCollections(id: string, collection: Collection) {
  const collections = await getCollections();
  const collectionIndex = collections.findIndex((c) => c.id === id);

  if (collectionIndex === -1) {
    throw new Error(`Collection with id "${id}" not found`);
  }

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

export async function addCollectionAndWriteToJson(collection: Collection) {
  const collections = await getCollections();
  collections.unshift(collection);
  await writeJSONFile(COLLECTION_JSON_FILE_PATH, collections);
}

export async function renameDirectoriesUsingSlug(
  oldSlug: string,
  newSlug: string,
) {
  /*
   * Every per-slug directory has to move together. PREVIEW was previously
   * missing here, so renaming a slug orphaned the 320px previews under the old
   * name — every admin tile then 404'd and silently fell back to the committed
   * thumbs.
   *
   * Each rename is also skipped when the source doesn't exist, rather than
   * throwing. A slug edited before publishing has no thumbs/full yet, and an
   * unguarded fs.rename threw ENOENT part-way through — leaving originals
   * renamed but derivatives not, i.e. exactly the split state this is meant to
   * avoid.
   */
  const directories = [
    ORIGINAL_IMAGE_DIRECTORY,
    PREVIEW_IMAGE_DIRECTORY,
    THUMBS_IMAGE_DIRECTORY,
    FULL_IMAGE_DIRECTORY,
  ];

  await Promise.all(
    directories.map(async (directory) => {
      const from = `${directory}/${oldSlug}`;
      const to = `${directory}/${newSlug}`;

      if (!(await directoryExists(from))) return;

      await renameDirectory(from, to);
    }),
  );
}
