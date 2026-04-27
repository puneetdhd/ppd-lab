import { Router } from 'express';
import {
  createStudent,
  getAllStudents,
  getStudentById,
  getStudentsByBatch,
  getMyStudentProfile,
  deleteStudent,
  bulkCreateStudents,
} from '../controllers/student.controller';
import { verifyToken } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

router.post('/', verifyToken, requireRole('admin'), createStudent);
router.get('/', verifyToken, requireRole('admin'), getAllStudents);
router.get('/me', verifyToken, requireRole('student'), getMyStudentProfile);
router.post('/bulk', verifyToken, requireRole('admin'), bulkCreateStudents);
router.get('/batch/:batchId', verifyToken, requireRole('admin', 'teacher'), getStudentsByBatch);
router.get('/:id', verifyToken, requireRole('admin'), getStudentById);
router.delete('/:id', verifyToken, requireRole('admin'), deleteStudent);

export default router;
