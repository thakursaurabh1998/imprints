import config from '@/config';

export function getCollectionsStaticPaths() {
  return config.collections.map((collection) => ({
    collection: collection.slug,
  }));
}
