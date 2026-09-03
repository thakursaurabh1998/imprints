export const IS_PRODUCTION = process.env.NODE_ENV === 'production';
// Full-resolution uploads. Read server-side by sharp during publish and never
// fetched by URL, so they live outside public/ — otherwise `next build` would
// copy every original into out/, and a local build+deploy would publish them.
export const ORIGINAL_IMAGE_DIRECTORY = './.admin-scratch/originals';
// Previews are the one piece of scratch the browser DOES fetch (the admin
// grid renders them), so they have to stay under public/ to be served.
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
