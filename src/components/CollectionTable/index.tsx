import { SyntheticEvent } from 'react';

import { Collection } from '@/utils/collection-config';
import {
  getPreviewSource,
  getThumbsFallbackSource,
} from '@/utils/picture-source';
import { Badge, Button } from '@/components/ui';
import styles from './CollectionTable.module.css';

export type AdminCollection = Collection & { hasDraft?: boolean };

function Cover({ collection }: { collection: AdminCollection }) {
  if (!collection.cover) {
    return (
      <div className={styles.coverEmpty} aria-hidden="true">
        ▢
      </div>
    );
  }

  return (
    <img
      className={styles.cover}
      src={getPreviewSource(collection.slug, collection.cover)}
      alt=""
      loading="lazy"
      width={56}
      height={56}
      onError={(e: SyntheticEvent<HTMLImageElement>) => {
        // Legacy collections predate the 320px previews and only have the
        // committed thumbs, so fall back once (guarded against a loop).
        const fallback = getThumbsFallbackSource(
          collection.slug,
          collection.cover,
        );
        if (e.currentTarget.src.endsWith(fallback)) return;
        e.currentTarget.src = fallback;
      }}
    />
  );
}

export default function CollectionTable({
  collections,
  loading = false,
}: {
  collections?: AdminCollection[];
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className={styles.wrap}>
        <table className={styles.table}>
          <tbody>
            {Array.from({ length: 4 }).map((_, i) => (
              <tr key={i} className={styles.skeletonRow}>
                <td className={styles.coverCell}>
                  <div className={`${styles.skeleton} ${styles.skeletonCover}`} />
                </td>
                <td>
                  <div className={styles.skeleton} style={{ width: '45%' }} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (!collections || collections.length === 0) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyTitle}>No collections yet</p>
        <p className={styles.emptyBody}>
          Create one, then drop your photos straight into it.
        </p>
        <Button variant="primary" href="/admin/collections/new">
          New collection
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            {/* Visually-hidden text rather than aria-label on an empty <th>:
                screen readers treat an empty labelled cell inconsistently. */}
            <th scope="col" className={styles.coverCell}>
              <span className={styles.srOnly}>Cover</span>
            </th>
            <th scope="col">Collection</th>
            <th scope="col" className={styles.descriptionHead}>
              Description
            </th>
            <th scope="col" className={`${styles.countCell} ${styles.numeric}`}>
              Photos
            </th>
            <th scope="col" className={styles.actionsCell}>
              <span className={styles.srOnly}>Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {collections.map((collection) => {
            const editHref = `/admin/collections/edit?id=${collection.id}`;

            return (
              <tr key={collection.id} className={styles.row}>
                <td className={styles.coverCell}>
                  <Cover collection={collection} />
                </td>

                <td className={styles.titleCell}>
                  <a href={editHref} className={styles.titleLink}>
                    {collection.title}
                  </a>
                  <div className={styles.meta}>
                    <Badge mono>/{collection.slug}</Badge>
                    {collection.hasDraft && (
                      <Badge tone="accent" dot>
                        Unpublished
                      </Badge>
                    )}
                  </div>
                </td>

                <td>
                  <div className={styles.description}>
                    {collection.description}
                  </div>
                </td>

                <td className={styles.countCell}>
                  <span className={styles.count}>
                    {collection.pictures.length}
                  </span>
                </td>

                <td className={styles.actionsCell}>
                  <div className={styles.actions}>
                    <Button
                      size="sm"
                      variant="ghost"
                      href={`/collection/${collection.slug}`}
                    >
                      Preview
                    </Button>
                    <Button size="sm" href={editHref}>
                      Edit
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
