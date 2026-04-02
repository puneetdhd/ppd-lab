import { Router } from 'express';
import { getAnalysisByAssignment, getMyAnalysis } from '../controllers/analysis.controller';
import { verifyToken } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

// Teacher: view their own analysis across all assignments
router.get('/my', verifyToken, requireRole('teacher'), getMyAnalysis);

// Teacher/Admin: analysis for a specific assignment
router.get('/:assignmentId', verifyToken, requireRole('teacher', 'admin'), getAnalysisByAssignment);

export default router;
