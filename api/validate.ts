import type { ZodType } from 'zod';
import type { VercelResponse } from '@vercel/node';

export function parseBody<T>(
  schema: ZodType<T>,
  body: unknown,
  res: VercelResponse
): T | null {
  const result = schema.safeParse(body);
  if (!result.success) {
    const issue = result.error.issues[0];
    const path = issue?.path?.length ? `${issue.path.join('.')}: ` : '';
    res.status(400).json({ error: `${path}${issue?.message ?? 'Invalid request body'}` });
    return null;
  }
  return result.data;
}
