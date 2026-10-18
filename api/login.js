import { signToken, tokenTtlSeconds, verifyCredentials } from './_lib/auth.js';
import { fail, handleError, json, methodNotAllowed, parseBody } from './_lib/http.js';
import { loginSchema } from './_lib/schema.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return methodNotAllowed(res, ['POST']);
  }

  try {
    const body = await parseBody(req);
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return fail(res, 400, 'INVALID_INPUT', '请输入账号和密码');
    }

    // 固定延迟，降低暴力破解速度
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (!verifyCredentials(parsed.data.username, parsed.data.password)) {
      return fail(res, 401, 'INVALID_CREDENTIALS', '账号或密码错误');
    }

    return json(res, 200, {
      token: signToken('admin'),
      user: { name: parsed.data.username },
      expiresIn: tokenTtlSeconds
    });
  } catch (error) {
    return handleError(res, error);
  }
}
