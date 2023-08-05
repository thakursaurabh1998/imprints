import { Metadata } from 'next';

import PhotoCard from '@/components/PhotoCard';
import photogridStyles from '@/components/PhotoGrid/PhotoGrid.module.css';
import config from '@/config';

export const metadata: Metadata = {
  title: config.title,
  description: config.subtitle,
  viewport: 'width=device-width, initial-scale=1',
};

export default function Home() {
  return (
    <div className={photogridStyles['photo-wrapper']}>
      <section id={photogridStyles.photos}>
        {config.collections.map((collection) => (
          <div key={collection.slug} style={{ padding: 8 }}>
            <PhotoCard
              title={collection.title}
              slug={collection.slug}
              description={collection.description}
              cover={`/images/thumbs/${collection.slug}/${collection.cover}`}
            />
          </div>
        ))}
      </section>
    </div>
  );
}
