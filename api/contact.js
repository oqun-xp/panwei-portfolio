import crypto from 'node:crypto';
import { fail, handleError, json, methodNotAllowed, parseBody } from './_lib/http.js';
import { contactSchema } from './_lib/schema.js';
import { readContent, writeContent } from './_lib/store.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return methodNotAllowed(res, ['POST']);
  }

  try {
    const body = await parseBody(req);
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      return fail(
        res,
        400,
        'VALIDATION_ERROR',
        parsed.error.issues[0]?.message || '请检查表单内容'
      );
    }

    const content = await readContent();
    const message = {
      id: crypto.randomUUID(),
      name: parsed.data.name,
      email: parsed.data.email,
      content: parsed.data.content,
      createdAt: new Date().toISOString(),
      read: false
    };

    const next = {
      ...content,
      messages: [message, ...(Array.isArray(content.messages) ? content.messages : [])],
      updatedAt: new Date().toISOString()
    };

    await writeContent(next);
    return json(res, 200, { ok: true, message: '留言已发送，我会尽快回复你。' });
  } catch (error) {
    return handleError(res, error);
  }
}
