import { IncomingMessage, ServerResponse } from 'node:http';
import { Readable } from 'node:stream';

export function toWebRequest(req: IncomingMessage): Request {
  const url = `http://${req.headers.host ?? 'localhost'}${req.url}`;

  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      for (const v of value) headers.append(key, v);
    } else {
      headers.set(key, value);
    }
  }

  const hasBody = req.method !== 'GET' && req.method !== 'HEAD';

  return new Request(url, {
    method: req.method,
    headers,
    // Node's IncomingMessage converts directly to a web ReadableStream;
    // `duplex: 'half'` is required by the Fetch spec whenever a Request is
    // constructed with a streaming body.
    body: hasBody ? (Readable.toWeb(req) as ReadableStream) : undefined,
    duplex: hasBody ? 'half' : undefined,
  } as RequestInit);
}

export async function sendWebResponse(
  response: Response,
  res: ServerResponse,
): Promise<void> {
  res.statusCode = response.status;

  for (const [key, value] of response.headers) {
    res.setHeader(key, value);
  }

  if (!response.body) {
    res.end();
    return;
  }

  const nodeStream = Readable.fromWeb(response.body as never);

  await new Promise<void>((resolve, reject) => {
    nodeStream.pipe(res);
    nodeStream.on('end', resolve);
    nodeStream.on('error', reject);
  });
}
