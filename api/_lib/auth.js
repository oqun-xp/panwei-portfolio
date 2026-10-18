import crypto from 'node:crypto';
import { fail, getBearer } from './http.js';

const TOKEN_TTL_SECONDS = 60 * 60 * 12;

function getSecret() {
  if (!process.env.AUTH_SECRET) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('AUTH_SECRET_MISSING');
    }
    return 'dev-only-secret-panwei-portfolio';
  }
  return process.env.AUTH_SECRET;
}

function sign(data) {
  return crypto.createHmac('sha256', getSecret()).update(data).digest('base64url');
}

function safeEqual(left, right) {
  const a = crypto.createHash('sha256').update(String(left)).digest();
  const b = crypto.createHash('sha256').update(String(right)).digest();
  return crypto.timingSafeEqual(a, b);
}

export function signToken(subject = 'admin') {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: subject,
    iat: now,
    exp: now + TOKEN_TTL_SECONDS
  };
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${body}.${sign(body)}`;
}

export function verifyToken(token) {
  if (!token || typeof token !== 'string') return null;
  const [body, signature] = token.split('.');
  if (!body || !signature) return null;

  const expected = sign(body);
  const receivedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (
    receivedBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(receivedBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (!payload?.sub || typeof payload.exp !== 'number') return null;
    if (payload.exp <= Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch (error) {
    return null;
  }
}

export function verifyCredentials(username, password) {
  const expectedUsername = process.env.ADMIN_USERNAME || 'admin';
  const expectedPassword = process.env.ADMIN_PASSWORD || 'Panwei@2026';
  return safeEqual(username || '', expectedUsername) && safeEqual(password || '', expectedPassword);
}

export function requireAuth(req, res) {
  const token = getBearer(req);
  const payload = verifyToken(token);
  if (!payload) {
    fail(res, 401, 'UNAUTHORIZED', '登录已过期，请重新登录');
    return null;
  }
  return payload;
}

export const tokenTtlSeconds = TOKEN_TTL_SECONDS;
