import { Router } from 'express';
import {
  createSubject,
  getAllSubjects,
  getSubjectById,
  updateSubject,
  deleteSubject,
} from '../controllers/subject.controller';
import { verifyToken } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

// GET is accessible to all authenticated users; mutations are admin-only
router.get('/', verifyToken, getAllSubjects);
router.get('/:id', verifyToken, getSubjectById);

router.post('/', verifyToken, requireRole('admin'), createSubject);
router.put('/:id', verifyToken, requireRole('admin'), updateSubject);
router.delete('/:id', verifyToken, requireRole('admin'), deleteSubject);

export default router;
