import type { ContentData, Message } from '../types';

const TOKEN_KEY = 'panwei_portfolio_token';

export class ApiError extends Error {
  status: number;
  code: string;

  constructor(message: string, status = 0, code = 'UNKNOWN') {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

export function getToken(): string {
  return localStorage.getItem(TOKEN_KEY) || '';
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function decodeToken(token: string): { sub: string; iat: number; exp: number } | null {
  try {
    const [body] = token.split('.');
    const json = JSON.parse(atob(body.replace(/-/g, '+').replace(/_/g, '/')));
    if (typeof json.exp !== 'number') return null;
    return json;
  } catch (error) {
    return null;
  }
}

export function isTokenValid(token: string): boolean {
  const payload = decodeToken(token);
  if (!payload) return false;
  return payload.exp * 1000 > Date.now();
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }
  const token = getToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(path, { ...options, headers });
  } catch (error) {
    throw new ApiError('网络连接失败，请稍后重试', 0, 'NETWORK_ERROR');
  }

  let data: unknown = null;
  try {
    data = await response.json();
  } catch (error) {
    data = null;
  }

  if (!response.ok) {
    const payload = data as { error?: { message?: string; code?: string } } | null;
    throw new ApiError(
      payload?.error?.message || `请求失败（${response.status}）`,
      response.status,
      payload?.error?.code || 'REQUEST_FAILED'
    );
  }

  return data as T;
}

export const api = {
  getContent(): Promise<ContentData> {
    return request<ContentData>('/api/content');
  },

  login(username: string, password: string): Promise<{
    token: string;
    user: { name: string };
    expiresIn: number;
  }> {
    return request('/api/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
  },

  verifyToken(): Promise<{ ok: boolean; user: { name: string }; exp: number }> {
    return request('/api/auth-verify');
  },

  saveContent(content: ContentData): Promise<ContentData> {
    const payload = {
      profile: content.profile,
      skills: content.skills,
      projects: content.projects,
      posts: content.posts,
      settings: content.settings
    };
    return request('/api/content', {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },

  sendContact(payload: { name: string; email: string; content: string }): Promise<{
    ok: boolean;
    message: string;
  }> {
    return request('/api/contact', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  getMessages(): Promise<{ messages: Message[] }> {
    return request('/api/messages');
  },

  updateMessage(id: string, read: boolean): Promise<{ messages: Message[] }> {
    return request('/api/messages', {
      method: 'PATCH',
      body: JSON.stringify({ id, read })
    });
  },

  deleteMessage(id: string): Promise<{ messages: Message[] }> {
    return request(`/api/messages?id=${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
  }
};
