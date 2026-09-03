/*
 * Live sanitiser — safe to run on every keystroke.
 *
 * Deliberately does NOT strip leading/trailing hyphens. While you type
 * "norway-fjords" the hyphen is momentarily the LAST character, so trimming
 * edges here swallows that keystroke and re-renders the controlled input
 * without it — making a hyphen impossible to enter at all. Edge-trimming
 * belongs on blur/submit (see tidySlug), not mid-typing.
 */
export function toSlugChars(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

/** Final tidy. Only safe once the field is no longer being typed into. */
export function tidySlug(value: string) {
  return toSlugChars(value).replace(/^-+|-+$/g, '');
}
