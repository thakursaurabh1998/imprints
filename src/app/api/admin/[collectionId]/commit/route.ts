import { NextRequest, NextResponse } from 'next/server';

import { IS_PRODUCTION } from '@/utils/constants';
import { GitCommandError } from '@/utils/git';
import { withGitLock } from '@/utils/git-lock';
import {
  CollectionNotFoundError,
  commitCollectionAndPush,
} from '@/utils/publish-commit';

export async function POST(
  req: NextRequest,
  context: { params: { collectionId: string } },
) {
  if (IS_PRODUCTION) {
    return new Response('Not available in production', { status: 403 });
  }

  const { collectionId } = context.params;

  try {
    const result = await withGitLock(() =>
      commitCollectionAndPush(collectionId),
    );
    return NextResponse.json(result);
  } catch (err) {
    return mapErrorToResponse(err);
  }
}

function mapErrorToResponse(err: unknown): Response {
  if (err instanceof CollectionNotFoundError) {
    return new Response('Collection not found!', { status: 404 });
  }

  if (err instanceof GitCommandError) {
    switch (err.code) {
      case 'NOT_A_REPO':
        return new Response(
          "This project isn't inside a git repository — Commit & push isn't available here.",
          { status: 500 },
        );
      case 'WRONG_REPO_ROOT':
        return new Response(
          "The dev server's working directory doesn't match the git repo root — restart it from the repo root.",
          { status: 500 },
        );
      case 'NO_ORIGIN_REMOTE':
        return new Response(
          'No "origin" remote is configured — add one before committing.',
          { status: 500 },
        );
      case 'FETCH_FAILED':
        return new Response(
          "Couldn't reach origin (network or auth error). Nothing on disk was touched.",
          { status: 502 },
        );
      case 'NO_GIT_IDENTITY':
        return new Response(
          'Git has no user.name/user.email configured — set them before committing.',
          { status: 500 },
        );
      case 'PUSH_REJECTED':
        return new Response(
          "Push rejected — the remote branch has commits this tool doesn't know about. Try again.",
          { status: 409 },
        );
      case 'PUSH_NETWORK_FAILED':
        return new Response(
          'Push to origin failed — the commit was built but not pushed. Try again; nothing is lost.',
          { status: 502 },
        );
      case 'COMMIT_BUILD_FAILED':
      case 'COMMAND_FAILED':
      default:
        return new Response(
          `Could not build the commit — ${err.stderr || err.message}`,
          { status: 500 },
        );
    }
  }

  return new Response(err instanceof Error ? err.message : 'Unknown error', {
    status: 500,
  });
}
