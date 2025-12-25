import pinoHttp from 'pino-http';
import logger from '../utils/logger.js';

/**
 * HTTP Request Logger Middleware
 * 
 * Logs all incoming HTTP requests with:
 * - Request method and URL
 * - Response status code
 * - Response time
 */
export const requestLogger = pinoHttp({
  logger,
  
  // Customize the log message
  customLogLevel: (_req, res, err) => {
    if (res.statusCode >= 500 || err) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
  
  // Don't log health check requests (reduces noise)
  autoLogging: {
    ignore: (req) => req.url === '/api/v1/curriculum/health',
  },
});
