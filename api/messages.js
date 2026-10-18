import { requireAuth } from './_lib/auth.js';
import { fail, getQuery, handleError, json, methodNotAllowed, parseBody } from './_lib/http.js';
import { messagePatchSchema } from './_lib/schema.js';
import { readContent, writeContent } from './_lib/store.js';

function sortMessages(messages) {
  return [...messages].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export default async function handler(req, res) {
  if (!requireAuth(req, res)) return;

  try {
    const content = await readContent();
    const messages = Array.isArray(content.messages) ? content.messages : [];

    if (req.method === 'GET') {
      return json(res, 200, { messages: sortMessages(messages) });
    }

    if (req.method === 'PATCH') {
      const body = await parseBody(req);
      const parsed = messagePatchSchema.safeParse(body);
      if (!parsed.success) {
        return fail(res, 400, 'VALIDATION_ERROR', '留言参数不正确');
      }

      const nextMessages = messages.map((message) =>
        message.id === parsed.data.id ? { ...message, read: parsed.data.read } : message
      );

      await writeContent({
        ...content,
        messages: nextMessages,
        updatedAt: new Date().toISOString()
      });

      return json(res, 200, { messages: sortMessages(nextMessages) });
    }

    if (req.method === 'DELETE') {
      const { id } = getQuery(req);
      if (!id) return fail(res, 400, 'INVALID_INPUT', '缺少留言 id');

      const nextMessages = messages.filter((message) => message.id !== id);
      await writeContent({
        ...content,
        messages: nextMessages,
        updatedAt: new Date().toISOString()
      });

      return json(res, 200, { messages: sortMessages(nextMessages) });
    }

    return methodNotAllowed(res, ['GET', 'PATCH', 'DELETE']);
  } catch (error) {
    return handleError(res, error);
  }
}
