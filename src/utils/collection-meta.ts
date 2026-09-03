import config from '@/config';

// NOTE: this module must stay import-free of anything touching the filesystem
// (collection-config.ts, fs/promises). It's value-imported by client
// components (the admin edit page), which reads the webpack-bundled
// collections.json snapshot below. Disk-backed lookups for API routes live in
// collection-config.ts (getCollectionById) instead.
export function getCollectionMetaBySlug(collection: string) {
  return config.collections.find((c) => c.slug === collection) ?? null;
}

export function getCollectionMetaById(id: string) {
  return config.collections.find((c) => c.id === id) ?? null;
}
