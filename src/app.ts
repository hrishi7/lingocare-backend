import express, { Express } from 'express';
import cors from 'cors';
import v1Routes from './api/v1/routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';
import config from './config/index.js';
import logger from './utils/logger.js';

/**
 * Express Application Setup
 * 
 * Configures middleware and routes.
 * Exported separately from server.ts for testing.
 */
const app: Express = express();

// Request logging
app.use(requestLogger);

// CORS configuration
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes - Versioned
app.use('/api/v1', v1Routes);

// Root health check
app.get('/', (_req, res) => {
  res.json({ message: 'LingoCare Curriculum API', version: 'v1' });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'The requested resource was not found',
    },
  });
});

// Central error handler (must be last)
app.use(errorHandler);

logger.info({ env: config.nodeEnv }, 'Express app configured');

export default app;
