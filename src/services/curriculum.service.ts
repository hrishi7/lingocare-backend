import type { Curriculum } from '../types/curriculum.types.js';
import { parsePDF } from '../utils/pdfParser.js';
import { AIServiceFactory } from './ai/AIServiceFactory.js';
import logger from '../utils/logger.js';

/**
 * Curriculum Service
 * 
 * Business logic layer for curriculum operations.
 * Coordinates between PDF parsing and AI generation.
 */
export class CurriculumService {
  /**
   * Generate curriculum from uploaded PDF buffer
   * @param fileBuffer - Buffer containing PDF file data
   * @returns Generated curriculum structure
   */
  async generateFromPDF(fileBuffer: Buffer): Promise<{ curriculum: Curriculum; aiProvider: string }> {
    logger.info('CurriculumService: Starting curriculum generation from PDF');
    
    // 1. Extract text from PDF
    const extractedContent = await parsePDF(fileBuffer);
    logger.debug({ contentLength: extractedContent.length }, 'PDF content extracted');
    
    // 2. Get AI service and generate curriculum
    const aiService = AIServiceFactory.createService();
    const curriculum = await aiService.generateCurriculum(extractedContent);
    
    logger.info({ 
      curriculumId: curriculum.id,
      aiProvider: aiService.getName(),
    }, 'Curriculum generation completed');
    
    return {
      curriculum,
      aiProvider: aiService.getName(),
    };
  }
  
  /**
   * Get current AI provider name
   */
  getAIProviderName(): string {
    return AIServiceFactory.createService().getName();
  }
}

// Export singleton instance
export const curriculumService = new CurriculumService();
