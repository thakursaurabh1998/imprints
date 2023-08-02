import config from '@/config';
import { Metadata } from 'next';
import { Collection } from './generate-collection-config';

export function generateCollectionMetadata(
  collectionObject: Collection | null,
): Metadata {
  if (!collectionObject) {
    return { title: config.title, description: config.subtitle };
  }

  const { slug, cover, description, title } = collectionObject;

  const url = `${config.baseUrl}/collection/${slug}`;
  const coverUrl = `${config.baseUrl}/images/thumbs/${slug}/${cover}`;
  const twitterId = `@${config.social.twitter}`;
  const formattedTitle = `${title} | ${config.title}`;

  return {
    metadataBase: new URL(config.baseUrl),
    title: formattedTitle,
    description,
    twitter: {
      title: formattedTitle,
      description,
      images: [{ url: coverUrl, alt: description }],
      creator: twitterId,
      card: 'summary_large_image',
    },
    openGraph: {
      title: formattedTitle,
      description,
      url,
      images: [{ url: coverUrl, alt: description }],
    },
  };
}
