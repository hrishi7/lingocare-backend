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
