import { Router } from 'express';
import {
  enterMark,
  updateMark,
  getStudentResults,
  getMarksByAssignment,
} from '../controllers/mark.controller';
import { verifyToken } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

// Teacher: enter and update marks
router.post('/', verifyToken, requireRole('teacher'), enterMark);
router.put('/:id', verifyToken, requireRole('teacher'), updateMark);

// Teacher/Admin: view marks for an assignment
router.get('/assignment/:assignmentId', verifyToken, requireRole('teacher', 'admin'), getMarksByAssignment);

// Student: view own results
router.get('/results', verifyToken, requireRole('student'), getStudentResults);

export default router;
