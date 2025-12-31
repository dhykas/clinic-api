import crypto from 'crypto';

export function createRequestHash(req: any): string {
  const payload = JSON.stringify({
    method: req.method,
    path: req.originalUrl,
    body: req.body,
  });

  return crypto
    .createHash('sha256')
    .update(payload)
    .digest('hex');
}
