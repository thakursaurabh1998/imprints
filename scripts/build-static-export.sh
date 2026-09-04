#!/usr/bin/env bash
set -uo pipefail

# next.config.js resolves to `output: 'export'` on every real `next build`.
# Static export requires every dynamic route segment to enumerate concrete
# params via generateStaticParams() — an empty array doesn't satisfy this
# (Next treats `!prerenderRoutes.length` the same as "no generateStaticParams
# at all"; see node_modules/next/dist/build/index.js, the
# `hasGenerateStaticParams` check). The admin tool's [collectionId] routes
# are dev-only by design (guarded by IS_PRODUCTION checks) and have no
# static params to enumerate, so they're excluded from the production
# build entirely rather than faked into it. `next dev` never uses
# output:'export', so nothing needs to change for local development.
#
# Idempotent: only moves a path if it's currently present at its source,
# so re-running after an interrupted build is safe.

HOLD_DIR=".build-excluded"

ADMIN_EDIT_SRC="src/app/admin/collections/[collectionId]/edit"
ADMIN_EDIT_HOLD="$HOLD_DIR/admin-edit"

API_ADMIN_SRC="src/app/api/admin/[collectionId]"
API_ADMIN_HOLD="$HOLD_DIR/api-admin-collectionId"

restore() {
  local status=$?
  [ -e "$ADMIN_EDIT_HOLD" ] && mv "$ADMIN_EDIT_HOLD" "$ADMIN_EDIT_SRC"
  [ -e "$API_ADMIN_HOLD" ] && mv "$API_ADMIN_HOLD" "$API_ADMIN_SRC"
  rmdir "$HOLD_DIR" 2>/dev/null || true
  exit "$status"
}
trap restore EXIT

mkdir -p "$HOLD_DIR"
[ -e "$ADMIN_EDIT_SRC" ] && mv "$ADMIN_EDIT_SRC" "$ADMIN_EDIT_HOLD"
[ -e "$API_ADMIN_SRC" ] && mv "$API_ADMIN_SRC" "$API_ADMIN_HOLD"

next build
