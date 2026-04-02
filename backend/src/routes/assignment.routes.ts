import { Router } from 'express';
import {
  assignTeacher,
  getAllAssignments,
  getAssignmentById,
  getMyAssignments,
  getAssignmentsByBatchSemester,
} from '../controllers/assignment.controller';
import { verifyToken } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

// Admin
router.post('/', verifyToken, requireRole('admin'), assignTeacher);
router.get('/', verifyToken, requireRole('admin'), getAllAssignments);
router.get('/:id', verifyToken, requireRole('admin', 'teacher'), getAssignmentById);
router.get('/batch/:batchId/semester/:semester', verifyToken, getAssignmentsByBatchSemester);

// Teacher
router.get('/my/assignments', verifyToken, requireRole('teacher'), getMyAssignments);

export default router;
