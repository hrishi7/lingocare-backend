import app from './app.js';
import config from './config/index.js';
import logger from './utils/logger.js';

/**
 * Server Entry Point
 * 
 * Starts the Express server.
 * Separated from app.ts to allow testing without starting the server.
 */
const server = app.listen(config.port, () => {
  logger.info({
    port: config.port,
    env: config.nodeEnv,
    aiProvider: config.aiProvider,
  }, `🚀 Server running on http://localhost:${config.port}`);
});

// Graceful shutdown
const shutdown = () => {
  logger.info('Received shutdown signal, closing server...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

export default server;
