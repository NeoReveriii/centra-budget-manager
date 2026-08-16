import type { VercelRequest, VercelResponse } from './http-types.js';

export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'private, no-store, max-age=0');
  return res.status(404).json({ error: 'Not found' });
}
