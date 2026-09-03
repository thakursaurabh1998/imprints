export function getPreviewSource(slug: string, filename: string) {
  return `/original/previews/${slug}/${filename}`;
}

export function getThumbsFallbackSource(slug: string, filename: string) {
  return `/images/thumbs/${slug}/${filename}`;
}

export function getThumbsSource(slug: string, filename: string) {
  return `/images/thumbs/${slug}/${filename}`;
}

export function getFullSource(slug: string, filename: string) {
  return `/images/full/${slug}/${filename}`;
}
