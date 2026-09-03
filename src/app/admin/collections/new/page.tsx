'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import useSWRMutation from 'swr/mutation';
import { v4 as uuid } from 'uuid';

import AdminHeader from '@/components/AdminHeader';
import { Button, Input, Panel, Textarea, useToast } from '@/components/ui';
import { Collection } from '@/utils/collection-config';
import { hideInProduction } from '@/utils/hide-in-production';
import { tidySlug, toSlugChars } from '@/utils/slug';
import styles from './page.module.css';

export default function NewCollection() {
  hideInProduction();

  const router = useRouter();
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [id] = useState(() => uuid());
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  // Once the slug is hand-edited, stop deriving it from the title.
  const [slugTouched, setSlugTouched] = useState(false);

  const { trigger } = useSWRMutation('/api/admin/new', createCollection);

  const effectiveSlug = slugTouched ? slug : tidySlug(title);
  const submittedSlug = tidySlug(effectiveSlug);
  const canSubmit =
    title.trim() !== '' && submittedSlug !== '' && description.trim() !== '';

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!canSubmit) {
      toast.show('Title, slug, and description are all required.', 'warning');
      return;
    }

    setLoading(true);

    try {
      const res = await trigger({
        id,
        title: title.trim(),
        slug: submittedSlug,
        description: description.trim(),
        cover: '',
        pictures: [],
      });

      if (res?.ok) {
        router.replace(`/admin/collections/${id}/edit`);
        return;
      }

      const reason = res ? await res.text() : 'Unknown error';
      toast.show(`Could not create the collection — ${reason}`, 'error');
    } catch (err) {
      toast.show(
        err instanceof Error ? err.message : 'Could not create the collection.',
        'error',
      );
    }

    setLoading(false);
  }

  return (
    <>
      <AdminHeader backHref="/admin/collections" title="New collection" />

      <form className={styles.form} onSubmit={handleSubmit}>
        <Panel title="Details">
          <div className={styles.grid}>
            <Input
              label="Title"
              placeholder="Prague"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
            <Input
              label="Slug"
              mono
              placeholder="prague"
              value={effectiveSlug}
              hint="URL and image folder name"
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(toSlugChars(e.target.value));
              }}
              onBlur={() => setSlug((current) => tidySlug(current))}
            />
            <div className={styles.full}>
              <Textarea
                label="Description"
                placeholder="A few lines about this set of photographs."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.footer}>
            <Button type="submit" variant="primary" loading={loading}>
              Create and add photos
            </Button>
            <span className={styles.footerNote}>
              You&apos;ll drop photos in on the next screen.
            </span>
          </div>
        </Panel>
      </form>
    </>
  );
}

function createCollection(url: string, { arg }: { arg: Partial<Collection> }) {
  return fetch(url, {
    method: 'POST',
    body: JSON.stringify(arg),
  });
}
