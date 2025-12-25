import { Request, Response, NextFunction } from 'express';
import { curriculumService } from '../../../services/curriculum.service';
import { BadRequestError } from '../../../utils/AppError';
import logger from '../../../utils/logger';
import type { ApiResponse, GenerateCurriculumResponse, HealthResponse } from '../../../types/curriculum.types';

/**
 * Curriculum Controller
 * 
 * Handles HTTP requests for curriculum operations.
 * Follows thin controller pattern - delegates to service layer.
 */

/**
 * Health check endpoint
 * GET /api/v1/curriculum/health
 */
export const healthCheck = async (
  _req: Request,
  res: Response<ApiResponse<HealthResponse>>,
  _next: NextFunction
): Promise<void> => {
  const response: ApiResponse<HealthResponse> = {
    success: true,
    data: {
      status: 'healthy',
      aiProvider: curriculumService.getAIProviderName(),
      timestamp: new Date().toISOString(),
    },
  };
  
  res.status(200).json(response);
};

/**
 * Generate curriculum from uploaded PDF
 * POST /api/v1/curriculum/generate
 */
export const generateCurriculum = async (
  req: Request,
  res: Response<ApiResponse<GenerateCurriculumResponse>>,
  next: NextFunction
): Promise<void> => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      throw BadRequestError('No file uploaded. Please upload a PDF file.', 'NO_FILE_UPLOADED');
    }

    // Check file type
    if (req.file.mimetype !== 'application/pdf') {
      throw BadRequestError('Invalid file type. Only PDF files are accepted.', 'INVALID_FILE_TYPE');
    }

    logger.info({ 
      filename: req.file.originalname,
      size: req.file.size,
    }, 'Processing PDF upload');

    // Generate curriculum
    const result = await curriculumService.generateFromPDF(req.file.buffer);

    const response: ApiResponse<GenerateCurriculumResponse> = {
      success: true,
      data: result,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Generate curriculum with SSE streaming
 * POST /api/v1/curriculum/generate-stream
 */
export const generateCurriculumStream = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      throw BadRequestError('No file uploaded. Please upload a PDF file.', 'NO_FILE_UPLOADED');
    }

    // Check file type
    if (req.file.mimetype !== 'application/pdf') {
      throw BadRequestError('Invalid file type. Only PDF files are accepted.', 'INVALID_FILE_TYPE');
    }

    logger.info({ 
      filename: req.file.originalname,
      size: req.file.size,
    }, 'Processing PDF upload with streaming');

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering

    // Send initial connection confirmation
    res.write(': connected\n\n');

    const startTime = Date.now();

    // Helper to send SSE event
    const sendEvent = (type: string, data: unknown) => {
      res.write(`event: ${type}\n`);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    // Generate curriculum with streaming
    const result = await curriculumService.generateFromPDFStream(
      req.file.buffer,
      // Progress callback
      (status, message, metadata) => {
        sendEvent('progress', { status, message, metadata, timestamp: new Date().toISOString() });
      },
      // Chunk callback
      (chunk, index) => {
        sendEvent('chunk', { chunk, chunkIndex: index, timestamp: new Date().toISOString() });
      }
    );

    // Send completion event
    const processingTime = Date.now() - startTime;
    sendEvent('complete', {
      curriculum: result.curriculum,
      aiProvider: result.aiProvider,
      processingTime,
      timestamp: new Date().toISOString(),
    });

    // Close the connection
    res.end();

    logger.info({ processingTime }, 'Streaming curriculum generation completed');
  } catch (error) {
    // Send error event
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorCode = (error as any).code || 'UNKNOWN_ERROR';
    
    res.write(`event: error\n`);
    res.write(`data: ${JSON.stringify({ 
      code: errorCode, 
      message: errorMessage,
      timestamp: new Date().toISOString(),
    })}\n\n`);
    
    res.end();
    
    logger.error({ error }, 'Streaming generation failed');
  }
};
