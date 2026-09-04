const REMOTE_URL_OWNER_REPO_PATTERN = /[:/]([^/:]+)\/([^/]+?)(?:\.git)?$/;

/**
 * Works for any origin URL form — https://github.com/owner/repo.git,
 * git@github.com:owner/repo.git, or an SSH config host alias like
 * personalgithub:owner/repo.git — by matching only the trailing owner/repo
 * segment, regardless of what precedes it. Returns null (never throws) if
 * the remote URL doesn't match; the caller treats that as "open a PR
 * manually," not a hard failure, since the commit/push already succeeded.
 */
export function buildGithubCompareUrl(
  originUrl: string,
  base: string,
  branch: string,
): string | null {
  const match = originUrl.trim().match(REMOTE_URL_OWNER_REPO_PATTERN);

  if (!match) return null;

  const [, owner, repo] = match;

  return `https://github.com/${owner}/${repo}/compare/${encodeURIComponent(
    base,
  )}...${encodeURIComponent(branch)}?expand=1`;
}
