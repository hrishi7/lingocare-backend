import { parsePDF } from '../../../src/utils/pdfParser';
import { AppError } from '../../../src/utils/AppError';
import pdf from 'pdf-parse';

// Mock the pdf-parse library
jest.mock('pdf-parse');
const mockPdf = pdf as unknown as jest.Mock;

describe('pdfParser', () => {
  const mockBuffer = Buffer.from('mock-pdf-buffer');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully parse a valid PDF', async () => {
    // Setup mock success response
    const mockData = {
      text: 'Extracted PDF text content',
      numpages: 1,
      info: {},
      metadata: {},
      version: '1.0.0',
    };
    mockPdf.mockResolvedValue(mockData);

    const result = await parsePDF(mockBuffer);

    expect(result).toBe(mockData.text);
    expect(mockPdf).toHaveBeenCalledWith(mockBuffer);
    expect(mockPdf).toHaveBeenCalledTimes(1);
  });

  it('should throw BadRequestError when PDF text is empty', async () => {
    // Setup mock response with empty text
    mockPdf.mockResolvedValue({
      text: '   ', // Empty or whitespace only
      numpages: 1,
    });

    await expect(parsePDF(mockBuffer)).rejects.toThrow(AppError);
    
    try {
      await parsePDF(mockBuffer);
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      if (error instanceof AppError) {
        expect(error.errorCode).toBe('EMPTY_PDF');
        expect(error.statusCode).toBe(400);
      }
    }
  });

  it('should throw BadRequestError when parsing fails', async () => {
    // Setup mock failure
    const originalError = new Error('Bad XRef');
    mockPdf.mockRejectedValue(originalError);

    await expect(parsePDF(mockBuffer)).rejects.toThrow(AppError);

    try {
      await parsePDF(mockBuffer);
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      if (error instanceof AppError) {
        expect(error.errorCode).toBe('PDF_PARSE_ERROR');
        expect(error.statusCode).toBe(400);
      }
    }
  });
});
