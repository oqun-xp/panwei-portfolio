import { requireAuth } from './_lib/auth.js';
import { handleError, json, methodNotAllowed, parseBody } from './_lib/http.js';
import { contentSchema } from './_lib/schema.js';
import { readContent, writeContent } from './_lib/store.js';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const content = await readContent();
      const { messages, ...publicContent } = content;
      return json(res, 200, publicContent);
    }

    if (req.method === 'PUT') {
      if (!requireAuth(req, res)) return;

      const body = await parseBody(req);
      const parsed = contentSchema.safeParse(body);
      if (!parsed.success) {
        const firstIssue = parsed.error.issues[0];
        return json(res, 400, {
          error: {
            code: 'VALIDATION_ERROR',
            message: `保存失败：${firstIssue?.message || '数据格式不正确'}`,
            details: parsed.error.issues.slice(0, 5)
          }
        });
      }

      const current = await readContent();
      const next = {
        ...parsed.data,
        messages: Array.isArray(current.messages) ? current.messages : [],
        updatedAt: new Date().toISOString()
      };

      const saved = await writeContent(next);
      return json(res, 200, saved);
    }

    return methodNotAllowed(res, ['GET', 'PUT']);
  } catch (error) {
    return handleError(res, error);
  }
}
