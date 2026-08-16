import { authGuardSchema } from './schemas.js';
import { parseBody } from './validate.js';
import {
  consumeRateLimit,
  envPositiveInteger,
  getClientIp,
  privateRateLimitKey,
  setRateLimitHeaders,
} from './rate-limit.js';
import type { VercelRequest, VercelResponse } from './http-types.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const payload = parseBody(authGuardSchema, req.body, res);
  if (!payload) return;

  try {
    const isLogin = payload.action === 'login';
    const limit = envPositiveInteger(
      isLogin ? 'AUTH_LOGIN_RATE_LIMIT_MAX' : 'AUTH_RESET_RATE_LIMIT_MAX',
      isLogin ? 10 : 5,
    );
    const windowSeconds = envPositiveInteger(
      isLogin ? 'AUTH_LOGIN_RATE_LIMIT_WINDOW_SECONDS' : 'AUTH_RESET_RATE_LIMIT_WINDOW_SECONDS',
      isLogin ? 10 * 60 : 60 * 60,
    );
    const ip = getClientIp(req);
    const result = await consumeRateLimit({
      key: privateRateLimitKey(`auth:${payload.action}`, ip),
      limit,
      windowSeconds,
    });

    setRateLimitHeaders(res, result);
    if (!result.allowed) {
      res.setHeader('Retry-After', String(result.retryAfterSeconds));
      return res.status(429).json({
        error: 'Too many attempts. Please wait before trying again.',
        retryAfterSeconds: result.retryAfterSeconds,
      });
    }

    return res.status(204).end();
  } catch (error: unknown) {
    console.error('Auth rate-limit guard failed:', error);
    return res.status(503).json({ error: 'Authentication is temporarily unavailable. Please try again.' });
  }
}
