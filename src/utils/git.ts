import { execFile } from 'child_process';
import { randomUUID } from 'crypto';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

const DEFAULT_TIMEOUT_MS = 15_000;
const MAX_BUFFER_BYTES = 10 * 1024 * 1024;

export type GitErrorCode =
  | 'NOT_A_REPO'
  | 'WRONG_REPO_ROOT'
  | 'NO_ORIGIN_REMOTE'
  | 'FETCH_FAILED'
  | 'PUSH_REJECTED'
  | 'PUSH_NETWORK_FAILED'
  | 'NO_GIT_IDENTITY'
  | 'COMMIT_BUILD_FAILED'
  | 'COMMAND_FAILED';

export class GitCommandError extends Error {
  code: GitErrorCode;

  stderr: string;

  args: string[];

  constructor(
    code: GitErrorCode,
    message: string,
    opts: { stderr?: string; args?: string[] } = {},
  ) {
    super(message);
    this.name = 'GitCommandError';
    this.code = code;
    this.stderr = opts.stderr ?? '';
    this.args = opts.args ?? [];
    Object.setPrototypeOf(this, GitCommandError.prototype);
  }
}

/**
 * The single chokepoint for shelling out to git. Always an argv array, never
 * a shell string — commit/collection titles are raw user text and must never
 * be given a chance to be parsed as shell syntax.
 */
async function runGit(
  args: string[],
  opts: { env?: Record<string, string>; timeoutMs?: number } = {},
): Promise<string> {
  try {
    const { stdout } = await execFileAsync('git', args, {
      cwd: process.cwd(),
      timeout: opts.timeoutMs ?? DEFAULT_TIMEOUT_MS,
      maxBuffer: MAX_BUFFER_BYTES,
      env: {
        ...process.env,
        GIT_TERMINAL_PROMPT: '0',
        ...opts.env,
      },
    });

    return stdout;
  } catch (err) {
    const execErr = err as { message: string; stderr?: string };

    throw new GitCommandError(
      'COMMAND_FAILED',
      `git ${args.join(' ')} failed: ${execErr.message}`,
      { stderr: execErr.stderr ?? '', args },
    );
  }
}

export async function verifyRepoRoot(): Promise<void> {
  let toplevel: string;

  try {
    toplevel = (await runGit(['rev-parse', '--show-toplevel'])).trim();
  } catch {
    throw new GitCommandError(
      'NOT_A_REPO',
      'This project is not inside a git repository.',
    );
  }

  if (path.resolve(toplevel) !== path.resolve(process.cwd())) {
    throw new GitCommandError(
      'WRONG_REPO_ROOT',
      "The server process's working directory does not match the git repository root.",
    );
  }
}

export async function hasOriginRemote(): Promise<boolean> {
  try {
    await runGit(['remote', 'get-url', 'origin']);
    return true;
  } catch {
    return false;
  }
}

export async function getOriginUrl(): Promise<string> {
  return (await runGit(['remote', 'get-url', 'origin'])).trim();
}

export async function fetchRef(refspec: string): Promise<void> {
  try {
    await runGit(['fetch', 'origin', refspec], { timeoutMs: 30_000 });
  } catch (err) {
    const stderr = err instanceof GitCommandError ? err.stderr : '';

    throw new GitCommandError(
      'FETCH_FAILED',
      `Could not fetch "${refspec}" from origin.`,
      { stderr, args: err instanceof GitCommandError ? err.args : [] },
    );
  }
}

export async function resolveRef(ref: string): Promise<string> {
  return (await runGit(['rev-parse', ref])).trim();
}

export async function remoteBranchExists(branch: string): Promise<boolean> {
  const stdout = await runGit(['ls-remote', 'origin', `refs/heads/${branch}`], {
    timeoutMs: 30_000,
  });

  return stdout.trim().length > 0;
}

export async function pathExistsInTree(
  commitSha: string,
  relativePath: string,
): Promise<boolean> {
  const stdout = await runGit(['ls-tree', commitSha, '--', relativePath]);
  return stdout.trim().length > 0;
}

export async function readBlobAtCommit(
  commitSha: string,
  relativePath: string,
): Promise<string | null> {
  if (!(await pathExistsInTree(commitSha, relativePath))) return null;
  return runGit(['cat-file', '-p', `${commitSha}:${relativePath}`]);
}

/**
 * Builds a commit directly against the object database, via a temp index
 * (GIT_INDEX_FILE) seeded from `parentSha` — never touching HEAD, the real
 * index, or the working tree's checked-out branch. `add` still reads the
 * real files on disk (whatever the publish step just wrote), it just
 * records them into the throwaway index instead of the developer's real
 * one. Safe to run while `next dev` is serving from the same working
 * directory, and safe regardless of what branch/uncommitted changes the
 * developer currently has checked out.
 */
export async function buildCommitFromWorkingTree(opts: {
  parentSha: string;
  pathspecs: string[];
  message: string;
}): Promise<
  | { status: 'committed'; commitSha: string; treeSha: string }
  | { status: 'nothing-to-commit' }
> {
  const tempIndex = path.join(
    os.tmpdir(),
    `imprints-git-index-${randomUUID()}`,
  );
  const gitEnv = { GIT_INDEX_FILE: tempIndex };

  try {
    await runGit(['read-tree', opts.parentSha], { env: gitEnv });
    await runGit(['add', '-A', '--', ...opts.pathspecs], { env: gitEnv });

    const treeSha = (await runGit(['write-tree'], { env: gitEnv })).trim();
    const parentTreeSha = (
      await runGit(['rev-parse', `${opts.parentSha}^{tree}`])
    ).trim();

    if (treeSha === parentTreeSha) {
      return { status: 'nothing-to-commit' };
    }

    let commitSha: string;

    try {
      commitSha = (
        await runGit([
          'commit-tree',
          treeSha,
          '-p',
          opts.parentSha,
          '-m',
          opts.message,
        ])
      ).trim();
    } catch (err) {
      const stderr = err instanceof GitCommandError ? err.stderr : '';

      if (
        /Please tell me who you are|unable to auto-detect email/i.test(stderr)
      ) {
        throw new GitCommandError(
          'NO_GIT_IDENTITY',
          'Git has no user.name/user.email configured.',
          { stderr, args: err instanceof GitCommandError ? err.args : [] },
        );
      }

      throw new GitCommandError(
        'COMMIT_BUILD_FAILED',
        'Could not build the commit.',
        { stderr, args: err instanceof GitCommandError ? err.args : [] },
      );
    }

    return { status: 'committed', commitSha, treeSha };
  } finally {
    await fs.unlink(tempIndex).catch(() => {});
  }
}

/**
 * Pushes a raw commit SHA (not a local branch/ref) to a remote branch, so
 * this never creates or moves any local ref either.
 */
export async function pushCommit(opts: {
  commitSha: string;
  branch: string;
}): Promise<void> {
  try {
    await runGit(
      ['push', 'origin', `${opts.commitSha}:refs/heads/${opts.branch}`],
      { timeoutMs: 30_000 },
    );
  } catch (err) {
    const stderr = err instanceof GitCommandError ? err.stderr : '';

    if (/non-fast-forward|rejected/i.test(stderr)) {
      throw new GitCommandError(
        'PUSH_REJECTED',
        'Push rejected — the remote branch has commits this tool does not know about.',
        { stderr, args: err instanceof GitCommandError ? err.args : [] },
      );
    }

    throw new GitCommandError('PUSH_NETWORK_FAILED', 'Push to origin failed.', {
      stderr,
      args: err instanceof GitCommandError ? err.args : [],
    });
  }
}
