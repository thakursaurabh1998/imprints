'use client';

import useSWR from 'swr';

import AdminHeader from '@/components/AdminHeader';
import CollectionTable, {
  AdminCollection,
} from '@/components/CollectionTable';
import { Badge, Button, Panel } from '@/components/ui';
import { ADMIN_API_URL } from '@/utils/admin-api';
import { hideInProduction } from '@/utils/hide-in-production';

async function fetcher(url: string) {
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Request to ${url} failed with status ${res.status}`);
  }

  return res.json();
}

export default function AdminPanel() {
  hideInProduction();

  const {
    data: collections,
    error,
    isLoading,
  } = useSWR<AdminCollection[]>(`${ADMIN_API_URL}/api/admin`, fetcher);

  const draftCount = collections?.filter((c) => c.hasDraft).length ?? 0;
  const photoCount =
    collections?.reduce((total, c) => total + c.pictures.length, 0) ?? 0;

  return (
    <>
      <AdminHeader
        title="Collections"
        badges={
          collections && (
            <>
              <Badge>{collections.length} collections</Badge>
              <Badge>{photoCount} photos</Badge>
              {draftCount > 0 && (
                <Badge tone="accent" dot>
                  {draftCount} unpublished
                </Badge>
              )}
            </>
          )
        }
        actions={
          <Button variant="primary" href="/admin/collections/new">
            New collection
          </Button>
        }
      />

      <Panel padded={false}>
        {error ? (
          <div style={{ padding: 28, color: '#ff8a8d', fontSize: 13.5 }}>
            Could not load collections — {error.message}
          </div>
        ) : (
          <CollectionTable collections={collections} loading={isLoading} />
        )}
      </Panel>
    </>
  );
}
