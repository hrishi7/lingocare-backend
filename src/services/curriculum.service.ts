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
   * Generate curriculum from PDF with streaming support
   * @param fileBuffer - Buffer containing PDF file data
   * @param onProgress - Callback for progress updates
   * @param onChunk - Callback for AI chunks
   * @returns Generated curriculum structure
   */
  async generateFromPDFStream(
    fileBuffer: Buffer,
    onProgress: (status: string, message: string, metadata?: Record<string, unknown>) => void,
    onChunk?: (chunk: string, index: number) => void
  ): Promise<{ curriculum: Curriculum; aiProvider: string }> {
    const startTime = Date.now();
    logger.info('CurriculumService: Starting streaming curriculum generation from PDF');
    
    try {
      // 1. Notify: Starting
      onProgress('started', 'Starting curriculum generation');
      
      // 2. Extract text from PDF
      onProgress('parsing_pdf', 'Parsing PDF document...');
      const extractedContent = await parsePDF(fileBuffer);
      logger.debug({ contentLength: extractedContent.length }, 'PDF content extracted');
      
      // 3. Notify: PDF parsed
      onProgress('pdf_parsed', 'PDF parsed successfully', { 
        contentLength: extractedContent.length 
      });
      
      // 4. Get AI service
      const aiService = AIServiceFactory.createService();
      
      // 5. Notify: Starting AI generation
      onProgress('generating_curriculum', `Generating curriculum using ${aiService.getName()}...`);
      
      // 6. Generate curriculum with streaming
      const curriculum = await aiService.generateCurriculumStream(
        extractedContent,
        (chunk, index) => {
          // Forward chunk events
          if (onChunk) {
            onChunk(chunk, index);
          }
          // Update progress periodically
          if (index % 10 === 0) {
            onProgress('ai_processing', `AI generating curriculum... (${index} chunks received)`);
          }
        }
      );
      
      // 7. Notify: Parsing response
      onProgress('parsing_response', 'Finalizing curriculum structure...');
      
      const processingTime = Date.now() - startTime;
      
      logger.info({ 
        curriculumId: curriculum.id,
        aiProvider: aiService.getName(),
        processingTime,
      }, 'Streaming curriculum generation completed');
      
      // 8. Notify: Complete
      onProgress('completed', 'Curriculum generated successfully', {
        processingTime,
        modules: curriculum.modules.length,
      });
      
      return {
        curriculum,
        aiProvider: aiService.getName(),
      };
    } catch (error) {
      logger.error({ error }, 'CurriculumService: Streaming generation failed');
      throw error;
    }
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

