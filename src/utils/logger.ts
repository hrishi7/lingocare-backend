import pino from 'pino';
import config from '../config/index.js';

/**
 * Pino Logger Instance
 * 
 * Why Pino?
 * - 5x faster than Winston (benchmarks)
 * - JSON output by default (perfect for log aggregation)
 * - Minimal API - easy to explain in interviews
 * - Low memory footprint
 * 
 * Usage:
 *   logger.info('message');
 *   logger.error({ err }, 'Error occurred');
 *   logger.debug({ data }, 'Debug info');
 */
const logger = pino({
  level: config.logLevel,
  
  // In development, use pino-pretty for readable output
  // In production, output raw JSON for log aggregation
  transport: config.nodeEnv === 'development' 
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
});

export default logger;
