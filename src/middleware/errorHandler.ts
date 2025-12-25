import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError.js';
import logger from '../utils/logger.js';
import type { ApiResponse } from '../types/curriculum.types.js';

/**
 * Central Error Handler Middleware
 * 
 * This is the single point for handling all errors in the application.
 * It distinguishes between operational errors (safe to show to client)
 * and programming errors (hide details from client).
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response<ApiResponse>,
  _next: NextFunction
): void => {
  // Log all errors
  logger.error({
    err: {
      message: err.message,
      stack: err.stack,
      name: err.name,
    },
    path: req.path,
    method: req.method,
  }, 'Error occurred');

  // Handle operational errors (expected failures)
  if (err instanceof AppError && err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.errorCode,
        message: err.message,
      },
    });
    return;
  }

  // Handle Multer errors (file upload)
  if (err.name === 'MulterError') {
    res.status(400).json({
      success: false,
      error: {
        code: 'FILE_UPLOAD_ERROR',
        message: err.message,
      },
    });
    return;
  }

  // Programming errors - don't leak details to client
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred. Please try again later.',
    },
  });
};
