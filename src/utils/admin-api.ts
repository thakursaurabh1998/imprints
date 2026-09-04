// The admin write-API runs as a standalone Node process (see server/), never
// bundled into the Next app or the exported production site. One place to
// point at it, rather than a bare `/api/admin` scattered across call sites.
export const ADMIN_API_URL =
  process.env.NEXT_PUBLIC_ADMIN_API_URL ?? 'http://localhost:4000';
