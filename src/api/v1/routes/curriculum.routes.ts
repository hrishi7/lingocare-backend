import { Router } from 'express';
import multer from 'multer';
import { healthCheck, generateCurriculum } from '../controllers/curriculum.controller.js';
import config from '../../../config/index.js';
import { BadRequestError } from '../../../utils/AppError.js';

const router = Router();

// Configure multer for file uploads
// Using memory storage since we don't need to persist files
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: config.maxFileSize, // 10MB default
  },
  fileFilter: (_req, file, cb) => {
    // Accept only PDF files
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(BadRequestError('Only PDF files are allowed', 'INVALID_FILE_TYPE'));
    }
  },
});

/**
 * Curriculum Routes
 * 
 * GET  /health   - Health check
 * POST /generate - Generate curriculum from PDF
 */

router.get('/health', healthCheck);
router.post('/generate', upload.single('file'), generateCurriculum);

export default router;
