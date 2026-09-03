export const IS_PRODUCTION = process.env.NODE_ENV === 'production';
export const ORIGINAL_IMAGE_DIRECTORY = './public/original/images';
export const PREVIEW_IMAGE_DIRECTORY = './public/original/previews';
// Drafts and trash are only ever read server-side through the admin API, so
// they must NOT live under public/ — `next build` copies all of public/ into
// out/, which would publish unpublished draft titles and descriptions along
// with removed photos. Previews are the opposite: they're fetched by URL by
// the admin grid, so they have to stay under public/.
export const DRAFT_DIRECTORY = './.admin-scratch/drafts';
export const TRASH_DIRECTORY = './.admin-scratch/trash';
export const THUMBS_IMAGE_DIRECTORY = './public/images/thumbs';
export const FULL_IMAGE_DIRECTORY = './public/images/full';
