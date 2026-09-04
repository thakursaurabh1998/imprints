import { createServer, IncomingMessage, ServerResponse } from 'node:http';

import { sendWebResponse, toWebRequest } from './http-adapter';
import { handleRequest } from './router';

const PORT = Number(process.env.ADMIN_API_PORT ?? 4000);
const ALLOWED_ORIGIN =
  process.env.ADMIN_ALLOWED_ORIGIN ?? 'http://localhost:3000';

function applyCors(res: ServerResponse) {
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

const server = createServer(
  async (req: IncomingMessage, res: ServerResponse) => {
    applyCors(res);

    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      res.end();
      return;
    }

    try {
      const response = await handleRequest(toWebRequest(req));
      await sendWebResponse(response, res);
    } catch (err) {
      console.error(err);
      if (!res.headersSent) res.statusCode = 500;
      res.end('Internal server error');
    }
  },
);

server.listen(PORT, () => {
  console.log(`Admin API listening on http://localhost:${PORT}`);
});
