import { Router } from 'express';
import {
  submitFeedback,
  getAllFeedback,
  getMyFeedbackAsStudent,
  getFeedbackForTeacher,
} from '../controllers/feedback.controller';
import { verifyToken } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

// Student: submit and view own feedback
router.post('/', verifyToken, requireRole('student'), submitFeedback);
router.get('/my', verifyToken, requireRole('student'), getMyFeedbackAsStudent);

// Teacher: view feedback received
router.get('/received', verifyToken, requireRole('teacher'), getFeedbackForTeacher);

// Admin: view all feedback
router.get('/', verifyToken, requireRole('admin'), getAllFeedback);

export default router;
