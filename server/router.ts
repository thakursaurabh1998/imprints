import { getCollection, updateCollection } from './routes/collection';
import { deleteDraft, getDraft, saveDraft } from './routes/draft';
import { deriveImages } from './routes/derive';
import { listCollections } from './routes/list';
import { createCollection } from './routes/new';
import { removePictures } from './routes/pictures-remove';
import { uploadImage } from './routes/upload';

type Params = Record<string, string>;
type Handler = (req: Request, params: Params) => Promise<Response>;

type Route = {
  method: string;
  pattern: RegExp;
  paramNames: string[];
  handler: Handler;
};

function route(method: string, path: string, handler: Handler): Route {
  const paramNames: string[] = [];

  const pattern = new RegExp(
    `^${path
      .split('/')
      .map((segment) => {
        if (segment.startsWith(':')) {
          paramNames.push(segment.slice(1));
          return '([^/]+)';
        }
        return segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      })
      .join('/')}$`,
  );

  return { method, pattern, paramNames, handler };
}

const routes: Route[] = [
  route('GET', '/api/admin', listCollections),
  route('POST', '/api/admin/new', createCollection),
  route('GET', '/api/admin/:collectionId', getCollection),
  route('PUT', '/api/admin/:collectionId', updateCollection),
  route('GET', '/api/admin/:collectionId/draft', getDraft),
  route('PUT', '/api/admin/:collectionId/draft', saveDraft),
  route('DELETE', '/api/admin/:collectionId/draft', deleteDraft),
  route('POST', '/api/admin/:collectionId/derive', deriveImages),
  route('POST', '/api/admin/:collectionId/upload', uploadImage),
  route('POST', '/api/admin/:collectionId/pictures/remove', removePictures),
];

export async function handleRequest(req: Request): Promise<Response> {
  const { pathname } = new URL(req.url);

  for (const candidate of routes) {
    if (candidate.method !== req.method) continue;

    const match = candidate.pattern.exec(pathname);
    if (!match) continue;

    const params: Params = {};
    candidate.paramNames.forEach((name, i) => {
      params[name] = decodeURIComponent(match[i + 1]);
    });

    return candidate.handler(req, params);
  }

  return new Response('Not found', { status: 404 });
}
