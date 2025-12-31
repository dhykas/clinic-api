import { Router } from 'express';
import prisma from '../config/prisma';

const router = Router();

router.get('/healthz', (_req, res) => {
  res.json({ status: 'ok' });
});

router.get('/readyz', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ready' });
  } catch {
    res.status(503).json({ status: 'not ready' });
  }
});

export default router;
