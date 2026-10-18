import { requireAuth } from './_lib/auth.js';
import { handleError, json, methodNotAllowed } from './_lib/http.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return methodNotAllowed(res, ['GET']);
  }

  try {
    const payload = requireAuth(req, res);
    if (!payload) return;
    return json(res, 200, {
      ok: true,
      user: { name: payload.sub },
      exp: payload.exp
    });
  } catch (error) {
    return handleError(res, error);
  }
}
