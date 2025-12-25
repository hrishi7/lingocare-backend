import request from 'supertest';
import app from '../../../src/app';
import { AIServiceFactory } from '../../../src/services/ai/AIServiceFactory';
import * as pdfParser from '../../../src/utils/pdfParser';

// Mock the PDF parser to avoid issues with manually crafted PDFs
jest.mock('../../../src/utils/pdfParser');
const mockParsePDF = pdfParser.parsePDF as jest.MockedFunction<typeof pdfParser.parsePDF>;

describe('Curriculum API', () => {
  beforeEach(() => {
    // Ensure we're using mock adapter for tests
    AIServiceFactory.clearCache();
    // Reset mocks
    jest.resetAllMocks();
  });

  describe('GET /api/v1/curriculum/health', () => {
    it('should return health status with 200', async () => {
      const response = await request(app)
        .get('/api/v1/curriculum/health')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          status: 'healthy',
          aiProvider: expect.any(String),
          timestamp: expect.any(String),
        },
      });
    });

    it('should return MockAI as provider in test environment', async () => {
      const response = await request(app)
        .get('/api/v1/curriculum/health')
        .expect(200);

      expect(response.body.data.aiProvider).toBe('MockAI');
    });
  });

  describe('POST /api/v1/curriculum/generate', () => {
    it('should return 400 when no file is uploaded', async () => {
      const response = await request(app)
        .post('/api/v1/curriculum/generate')
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        error: {
          code: 'NO_FILE_UPLOADED',
          message: expect.any(String),
        },
      });
    });

    it('should return 400 for non-PDF files', async () => {
      const response = await request(app)
        .post('/api/v1/curriculum/generate')
        .attach('file', Buffer.from('not a pdf'), {
          filename: 'test.txt',
          contentType: 'text/plain',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should generate curriculum from valid PDF', async () => {
      // Mock the PDF parser to return expected content
      mockParsePDF.mockResolvedValue('Module 1 - Test Content\nThis is a test curriculum.');
      
      // Create a PDF buffer (mocked, so content doesn't matter)
      const pdfContent = Buffer.from('mock-pdf-content');

      const response = await request(app)
        .post('/api/v1/curriculum/generate')
        .attach('file', pdfContent, {
          filename: 'test.pdf',
          contentType: 'application/pdf',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('curriculum');
      expect(response.body.data).toHaveProperty('aiProvider');
      expect(response.body.data.curriculum).toHaveProperty('id');
      expect(response.body.data.curriculum).toHaveProperty('title');
      expect(response.body.data.curriculum).toHaveProperty('modules');
      expect(Array.isArray(response.body.data.curriculum.modules)).toBe(true);
    });
  });

  describe('GET /api/v1/nonexistent', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app)
        .get('/api/v1/nonexistent')
        .expect(404);

      expect(response.body).toEqual({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: expect.any(String),
        },
      });
    });
  });

  describe('GET /', () => {
    it('should return API info', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('version');
    });
  });
});
