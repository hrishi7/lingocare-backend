import pdf from 'pdf-parse';
import logger from './logger.js';
import { AppError, BadRequestError } from './AppError.js';

/**
 * PDF Parser Utility
 * 
 * Extracts text content from PDF files using pdf-parse library.
 * Returns the extracted text for AI processing.
 */
export async function parsePDF(buffer: Buffer): Promise<string> {
  try {
    logger.debug('Starting PDF parsing');
    
    const data = await pdf(buffer);
    
    if (!data.text || data.text.trim().length === 0) {
      throw BadRequestError('PDF appears to be empty or contains only images', 'EMPTY_PDF');
    }
    
    logger.info({ pages: data.numpages, chars: data.text.length }, 'PDF parsed successfully');
    
    return data.text;
  } catch (error) {
    // Re-throw AppError instances (like BadRequestError) as-is
    if (error instanceof AppError) {
      throw error;
    }
    
    logger.error({ error }, 'Failed to parse PDF');
    throw BadRequestError('Failed to parse PDF file. Please ensure it is a valid PDF.', 'PDF_PARSE_ERROR');
  }
}
