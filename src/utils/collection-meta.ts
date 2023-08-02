import config from '@/config';

export function getCollectionMeta(collection: string) {
  return config.collections.find((c) => c.slug === collection) ?? null;
}
