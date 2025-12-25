/**
 * Custom Application Error Class
 * 
 * Distinguishes between:
 * - Operational errors (expected failures, client errors)
 * - Programming errors (bugs, unexpected failures)
 * 
 * Only operational errors expose details to clients.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: string;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    errorCode: string = 'INTERNAL_ERROR'
  ) {
    super(message);
    
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true; // Marks as operational (safe to show to client)
    
    // Maintains proper stack trace for where error was thrown
    Error.captureStackTrace(this, this.constructor);
  }
}

// Common error factories for convenience
export const BadRequestError = (message: string, code = 'BAD_REQUEST') => 
  new AppError(message, 400, code);

export const NotFoundError = (message: string, code = 'NOT_FOUND') => 
  new AppError(message, 404, code);

export const ValidationError = (message: string, code = 'VALIDATION_ERROR') => 
  new AppError(message, 422, code);

export const InternalError = (message: string, code = 'INTERNAL_ERROR') => 
  new AppError(message, 500, code);
