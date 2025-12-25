import { Router } from 'express';
import curriculumRoutes from './curriculum.routes.js';

const router = Router();

/**
 * API v1 Routes Aggregator
 * 
 * All v1 routes are mounted here.
 * This allows easy versioning: /api/v1/... and /api/v2/...
 */

router.use('/curriculum', curriculumRoutes);

export default router;
