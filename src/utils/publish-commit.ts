import path from 'path';

import {
  Collection,
  COLLECTION_JSON_FILE_PATH,
  getCollectionById,
} from './collection-config';
import {
  BASE_BRANCH,
  COLLECTION_BRANCH_PREFIX,
  FULL_IMAGE_DIRECTORY,
  THUMBS_IMAGE_DIRECTORY,
} from './constants';
import { directoryExists, fileExists } from './file-system';
import {
  buildCommitFromWorkingTree,
  fetchRef,
  getOriginUrl,
  GitCommandError,
  hasOriginRemote,
  pathExistsInTree,
  pushCommit,
  readBlobAtCommit,
  remoteBranchExists,
  resolveRef,
  verifyRepoRoot,
} from './git';
import { buildGithubCompareUrl } from './github-compare-url';

export class CollectionNotFoundError extends Error {}

export type CommitAndPushResult =
  | { status: 'nothing-to-commit'; branch: string }
  | {
      status: 'committed';
      branch: string;
      commitSha: string;
      reused: boolean;
      compareUrl: string | null;
    };

export async function commitCollectionAndPush(
  collectionId: string,
): Promise<CommitAndPushResult> {
  await verifyRepoRoot();

  if (!(await hasOriginRemote())) {
    throw new GitCommandError(
      'NO_ORIGIN_REMOTE',
      'No "origin" remote is configured.',
    );
  }

  const collection = await getCollectionById(collectionId);

  if (!collection) {
    throw new CollectionNotFoundError(`Collection "${collectionId}" not found`);
  }

  const branch = `${COLLECTION_BRANCH_PREFIX}${collection.slug}`;

  await fetchRef(BASE_BRANCH);
  const { sha: parentSha, reused } = await resolveParentSha(branch);

  const manifestPath = toPathspec(COLLECTION_JSON_FILE_PATH);
  const previousManifest = await readBlobAtCommit(parentSha, manifestPath);
  const previousCollections: Collection[] = previousManifest
    ? JSON.parse(previousManifest)
    : [];
  const previousEntry = previousCollections.find((c) => c.id === collectionId);
  const oldSlug = previousEntry?.slug ?? null;
  const oldPictures = previousEntry?.pictures ?? [];

  const pathspecs = await filterExistingPathspecs(
    buildCandidatePaths(collection.slug, oldSlug),
    parentSha,
  );

  const message = buildCommitMessage(collection, oldPictures);

  const built = await buildCommitFromWorkingTree({
    parentSha,
    pathspecs,
    message,
  });

  if (built.status === 'nothing-to-commit') {
    return { status: 'nothing-to-commit', branch };
  }

  await pushCommit({ commitSha: built.commitSha, branch });

  const originUrl = await getOriginUrl();
  const compareUrl = buildGithubCompareUrl(originUrl, BASE_BRANCH, branch);

  return {
    status: 'committed',
    branch,
    commitSha: built.commitSha,
    reused,
    compareUrl,
  };
}

/**
 * Always fresh from origin — never from whatever the developer's working
 * copy happens to be on — so an in-progress unrelated checkout can never
 * become the base of a content branch.
 */
async function resolveParentSha(
  branch: string,
): Promise<{ sha: string; reused: boolean }> {
  const reused = await remoteBranchExists(branch);

  if (!reused) {
    const originMainSha = await resolveRef(
      `refs/remotes/origin/${BASE_BRANCH}`,
    );
    return { sha: originMainSha, reused: false };
  }

  await fetchRef(`+refs/heads/${branch}:refs/remotes/origin/${branch}`);
  const branchSha = await resolveRef(`refs/remotes/origin/${branch}`);

  return { sha: branchSha, reused: true };
}

function buildCandidatePaths(slug: string, oldSlug: string | null): string[] {
  const thumbs = toPathspec(THUMBS_IMAGE_DIRECTORY);
  const full = toPathspec(FULL_IMAGE_DIRECTORY);

  const paths = [
    toPathspec(COLLECTION_JSON_FILE_PATH),
    `${thumbs}/${slug}`,
    `${full}/${slug}`,
  ];

  if (oldSlug && oldSlug !== slug) {
    paths.push(`${thumbs}/${oldSlug}`, `${full}/${oldSlug}`);
  }

  return paths;
}

/**
 * `git add -A -- <pathspec>` is fatal if a pathspec matches nothing in
 * either the working tree or the temp index (e.g. a legacy collection where
 * derive skipped every image, or a rename whose old directories were never
 * committed). Filtering to paths that exist on disk or in the parent tree
 * avoids that, and is also what captures a rename correctly: the old-slug
 * directories are gone from disk but present in the parent tree (recorded
 * as deletions), the new-slug directories are on disk but absent from the
 * parent tree (recorded as additions).
 */
async function filterExistingPathspecs(
  candidates: string[],
  parentSha: string,
): Promise<string[]> {
  const checked = await Promise.all(
    candidates.map(async (candidate) => {
      const [onDisk, inParentTree] = await Promise.all([
        existsOnDisk(candidate),
        pathExistsInTree(parentSha, candidate),
      ]);

      return onDisk || inParentTree ? candidate : null;
    }),
  );

  return checked.filter((candidate): candidate is string => candidate !== null);
}

async function existsOnDisk(relativePath: string): Promise<boolean> {
  const absolute = path.join(process.cwd(), relativePath);
  return (await fileExists(absolute)) || (await directoryExists(absolute));
}

function toPathspec(relativePath: string): string {
  return relativePath.replace(/^\.\//, '');
}

function buildCommitMessage(
  collection: Collection,
  oldPictures: string[],
): string {
  const added = collection.pictures.filter((p) => !oldPictures.includes(p));
  const removed = oldPictures.filter((p) => !collection.pictures.includes(p));

  const subject = `Publish: ${truncate(collection.title, 50)} (${
    collection.pictures.length
  } image${collection.pictures.length === 1 ? '' : 's'})`;

  const bodyLines = [collection.description, ''];

  if (added.length > 0) bodyLines.push('Added:', ...bulletList(added), '');
  if (removed.length > 0)
    bodyLines.push('Removed:', ...bulletList(removed), '');

  bodyLines.push('Auto-committed by the admin dashboard.');

  return `${subject}\n\n${bodyLines.join('\n')}`;
}

function truncate(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

function bulletList(items: string[], max = 20): string[] {
  const shown = items.slice(0, max).map((item) => `- ${item}`);

  if (items.length > max) {
    shown.push(`- …and ${items.length - max} more`);
  }

  return shown;
}
