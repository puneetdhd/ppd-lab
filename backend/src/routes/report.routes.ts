import { Router } from 'express';
import { subjectReport, batchReport, gradeDistribution } from '../controllers/report.controller';
import { verifyToken } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

// Admin/Teacher can access reports
router.get(
  '/subject/:assignmentId',
  verifyToken,
  requireRole('admin', 'teacher'),
  subjectReport
);
router.get('/batch/:batchId', verifyToken, requireRole('admin', 'teacher'), batchReport);
router.get(
  '/grades/:assignmentId',
  verifyToken,
  requireRole('admin', 'teacher'),
  gradeDistribution
);

export default router;
