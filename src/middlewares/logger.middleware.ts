import pinoHttp from 'pino-http';
import { logger } from '../utils/logger';

export const httpLogger = pinoHttp({
  logger,
  customLogLevel: (_req, res, err) => {
    if (err) return 'error';

    const statusCode = res?.statusCode ?? 0;

    if (statusCode >= 500) return 'error';
    if (statusCode >= 400) return 'warn';

    return 'info';
  },
});
