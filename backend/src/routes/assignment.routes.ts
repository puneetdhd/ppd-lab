import { Router } from 'express';
import {
  assignTeacher,
  getAllAssignments,
  getAssignmentById,
  getMyAssignments,
  getAssignmentsByBatchSemester,
  getStudentAssignments,
} from '../controllers/assignment.controller';
import { verifyToken } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

// Teacher: get my own assignments — MUST be before /:id
router.get('/my/assignments', verifyToken, requireRole('teacher'), getMyAssignments);

// Student: get assignments for their batch/semester (for feedback + viewing)
router.get('/student/my-subjects', verifyToken, requireRole('student'), getStudentAssignments);

// Batch+semester filter
router.get('/batch/:batchId/semester/:semester', verifyToken, getAssignmentsByBatchSemester);

// Admin
router.post('/', verifyToken, requireRole('admin'), assignTeacher);
router.get('/', verifyToken, requireRole('admin'), getAllAssignments);
router.get('/:id', verifyToken, requireRole('admin', 'teacher'), getAssignmentById);

export default router;
