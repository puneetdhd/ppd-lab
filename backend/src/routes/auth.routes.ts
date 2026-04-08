import { Router } from 'express';
import { login, registerStudent, registerTeacher, createAdmin } from '../controllers/auth.controller';
import { verifyToken } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

// Public
router.post('/login', login);
router.post('/register/student', registerStudent);
router.post('/register/teacher', registerTeacher);
router.post('/register/admin', createAdmin);

// Admin only — create another admin
router.post('/create-admin', verifyToken, requireRole('admin'), createAdmin);

export default router;
