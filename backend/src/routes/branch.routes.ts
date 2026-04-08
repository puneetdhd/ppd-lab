import { Router } from 'express';
import {
  createBranch,
  getAllBranches,
  getBranchById,
  updateBranch,
  deleteBranch,
} from '../controllers/branch.controller';
import { verifyToken } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

// Public GET — needed for registration dropdowns
router.get('/', getAllBranches);
router.get('/:id', getBranchById);

// Admin only — mutations
router.post('/', verifyToken, requireRole('admin'), createBranch);
router.put('/:id', verifyToken, requireRole('admin'), updateBranch);
router.delete('/:id', verifyToken, requireRole('admin'), deleteBranch);

export default router;
