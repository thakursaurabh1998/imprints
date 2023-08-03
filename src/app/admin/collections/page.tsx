import { notFound } from 'next/navigation';

import AdminCard from '@/components/AdminCard';
import config from '@/config';
import { isProduction } from '@/utils/is-production-environment';

export default function AdminPanel() {
  if (isProduction()) {
    notFound();
  }

  return (
    <div style={{ padding: 30 }}>
      <h1>Collections</h1>

      <div style={{ marginLeft: 100, marginRight: 100 }}>
        {config.collections.map((collection) => (
          <AdminCard collection={collection} key={collection.slug} />
        ))}
      </div>
    </div>
  );
}
