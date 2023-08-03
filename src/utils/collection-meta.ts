import config from '@/config';

export function getCollectionMetaBySlug(collection: string) {
  return config.collections.find((c) => c.slug === collection) ?? null;
}

export function getCollectionMetaById(id: string) {
  return config.collections.find((c) => c.id === id) ?? null;
}
