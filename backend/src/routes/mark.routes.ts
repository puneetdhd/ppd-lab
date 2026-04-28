import { Router } from 'express';
import {
  enterMark,
  updateMark,
  deleteMark,
  getStudentResults,
  getMarksByAssignment,
  bulkImportMarks,
} from '../controllers/mark.controller';
import { verifyToken } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

// Teacher: enter, update, delete marks
router.post('/', verifyToken, requireRole('teacher'), enterMark);
router.post('/bulk', verifyToken, requireRole('admin'), bulkImportMarks);
router.put('/:id', verifyToken, requireRole('teacher'), updateMark);
router.delete('/:id', verifyToken, requireRole('teacher'), deleteMark);

// Teacher/Admin: view marks for an assignment
router.get('/assignment/:assignmentId', verifyToken, requireRole('teacher', 'admin'), getMarksByAssignment);

// Student: view own results
router.get('/results', verifyToken, requireRole('student'), getStudentResults);

export default router;
