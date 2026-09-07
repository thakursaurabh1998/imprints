import { Metadata, Viewport } from 'next';

import PhotoCard from '@/components/PhotoCard';
import photogridStyles from '@/components/PhotoGrid/PhotoGrid.module.css';
import config from '@/config';
import { getThumbsSource } from '@/utils/picture-source';
import { getThumbDimensions } from '@/utils/thumb-dimensions';

export const metadata: Metadata = {
  title: config.title,
  description: config.subtitle,
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default async function Home() {
  /*
   * Same reasoning as the collection page: real cover dimensions let each card
   * reserve its height before the image downloads, so the masonry stops
   * re-flowing as covers arrive. `cover` is always a member of `pictures`, so a
   * published collection always has a committed thumb to measure.
   */
  const coverDimensions = await Promise.all(
    config.collections.map((collection) =>
      getThumbDimensions(collection.slug, collection.cover),
    ),
  );

  return (
    <div className={photogridStyles['photo-wrapper']}>
      <section id={photogridStyles.photos}>
        {config.collections.map((collection, index) => (
          <PhotoCard
            key={collection.slug}
            title={collection.title}
            slug={collection.slug}
            description={collection.description}
            cover={getThumbsSource(collection.slug, collection.cover)}
            coverWidth={coverDimensions[index]?.width}
            coverHeight={coverDimensions[index]?.height}
            priority={index === 0}
          />
        ))}
      </section>
    </div>
  );
}
