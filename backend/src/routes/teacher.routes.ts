import { Router } from 'express';
import {
  createTeacher,
  getAllTeachers,
  getTeacherById,
  getMyTeacherProfile,
  deleteTeacher,
} from '../controllers/teacher.controller';
import { verifyToken } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

// Admin: CRUD
router.post('/', verifyToken, requireRole('admin'), createTeacher);
router.get('/', verifyToken, requireRole('admin'), getAllTeachers);
router.get('/me', verifyToken, requireRole('teacher'), getMyTeacherProfile);
router.get('/:id', verifyToken, requireRole('admin'), getTeacherById);
router.delete('/:id', verifyToken, requireRole('admin'), deleteTeacher);

export default router;
