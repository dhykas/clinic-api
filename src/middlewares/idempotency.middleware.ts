import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { createRequestHash } from '../utils/request-hash';

const MAX_KEY_LENGTH = 255;

export async function idempotencyMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const rawKey = req.headers['idempotency-key'];

  // 🚨 REQUIRED for write endpoints
  if (typeof rawKey !== 'string') {
    return res.status(400).json({
      error: {
        code: 'IDEMPOTENCY_KEY_REQUIRED',
        message: 'Idempotency-Key header is required',
      },
    });
  }

  const key = rawKey.trim();

  if (!key) {
    return res.status(400).json({
      error: {
        code: 'INVALID_IDEMPOTENCY_KEY',
        message: 'Idempotency-Key must not be empty',
      },
    });
  }

  if (key.length > MAX_KEY_LENGTH) {
    return res.status(400).json({
      error: {
        code: 'INVALID_IDEMPOTENCY_KEY',
        message: 'Idempotency-Key is too long',
      },
    });
  }

  const requestHash = createRequestHash(req);

  const existing = await prisma.idempotencyKey.findUnique({
    where: { key },
  });

  if (existing) {
    if (existing.requestHash !== requestHash) {
      return res.status(409).json({
        error: {
          code: 'IDEMPOTENCY_KEY_CONFLICT',
          message: 'Idempotency-Key reused with different request payload',
        },
      });
    }

    return res.status(200).json(existing.response);
  }

  res.locals.idempotency = { key, requestHash };
  next();
}

