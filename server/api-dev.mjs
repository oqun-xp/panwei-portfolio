import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const port = Number(process.env.API_PORT || 8787);

function loadEnvFile(file) {
  if (!fs.existsSync(file)) return;
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const index = trimmed.indexOf('=');
    if (index === -1) continue;
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim().replace(/^['"]|['"]$/g, '');
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnvFile(path.join(root, '.env.local'));
loadEnvFile(path.join(root, '.env'));

const routes = {
  '/api/login': 'api/login.js',
  '/api/auth-verify': 'api/auth-verify.js',
  '/api/content': 'api/content.js',
  '/api/contact': 'api/contact.js',
  '/api/messages': 'api/messages.js'
};

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw.trim()) return {};
  return JSON.parse(raw);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://127.0.0.1:${port}`);
  const route = routes[url.pathname];

  if (!route) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ error: { code: 'NOT_FOUND', message: 'API 路由不存在' } }));
    return;
  }

  try {
    if (!['GET', 'HEAD'].includes(req.method || 'GET')) {
      req.body = await readBody(req);
    } else {
      req.body = {};
    }

    const filePath = path.join(root, route);
    const moduleUrl = `${pathToFileURL(filePath).href}?t=${Date.now()}`;
    const { default: handler } = await import(moduleUrl);

    console.log(`[api-dev] ${req.method} ${url.pathname}`);
    await handler(req, res);
  } catch (error) {
    console.error('[api-dev]', error);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(
        JSON.stringify({
          error: { code: 'DEV_INTERNAL_ERROR', message: error.message || '本地 API 出错' }
        })
      );
    }
  }
});

server.listen(port, '127.0.0.1', () => {
  const mode = process.env.GITHUB_DATA_TOKEN && process.env.GITHUB_DATA_REPO ? 'github' : 'local';
  console.log(`[api-dev] listening on http://127.0.0.1:${port} (storage: ${mode})`);
});
