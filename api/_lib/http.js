export function json(res, status, payload, headers = {}) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  Object.entries(headers).forEach(([key, value]) => res.setHeader(key, value));
  res.end(JSON.stringify(payload));
}

export function fail(res, status, code, message, details) {
  json(res, status, {
    error: {
      code,
      message,
      ...(details ? { details } : {})
    }
  });
}

export function methodNotAllowed(res, allowed) {
  res.setHeader('Allow', allowed.join(', '));
  fail(res, 405, 'METHOD_NOT_ALLOWED', `仅支持 ${allowed.join(' / ')} 请求`);
}

export async function parseBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string' && req.body.trim()) {
    return JSON.parse(req.body);
  }

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw.trim()) return {};
  return JSON.parse(raw);
}

export function getBearer(req) {
  const header = req.headers?.authorization || req.headers?.Authorization || '';
  const match = String(header).match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : '';
}

export function getQuery(req) {
  const url = new URL(req.url || '/', 'http://localhost');
  return Object.fromEntries(url.searchParams.entries());
}

export function handleError(res, error) {
  console.error('[api]', error);

  if (error?.name === 'SyntaxError') {
    return fail(res, 400, 'INVALID_JSON', '请求体不是合法的 JSON');
  }
  if (error?.message === 'DATA_STORE_NOT_CONFIGURED') {
    return fail(
      res,
      500,
      'DATA_STORE_NOT_CONFIGURED',
      '服务端未配置数据仓库，请检查 GITHUB_DATA_TOKEN 与 GITHUB_DATA_REPO'
    );
  }
  if (error?.message === 'DATA_FILE_NOT_FOUND') {
    return fail(res, 500, 'DATA_FILE_NOT_FOUND', '数据仓库中缺少 content.json');
  }
  if (error?.message === 'AUTH_SECRET_MISSING') {
    return fail(res, 500, 'AUTH_SECRET_MISSING', '服务端未配置 AUTH_SECRET');
  }
  if (error?.message?.startsWith('GITHUB_')) {
    return fail(res, 502, 'GITHUB_ERROR', '数据仓库写入失败，请稍后重试');
  }

  return fail(res, 500, 'INTERNAL_ERROR', '服务器开小差了，请稍后重试');
}
