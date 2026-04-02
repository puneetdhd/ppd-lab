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

// All branch routes — Admin only
router.use(verifyToken, requireRole('admin'));

router.post('/', createBranch);
router.get('/', getAllBranches);
router.get('/:id', getBranchById);
router.put('/:id', updateBranch);
router.delete('/:id', deleteBranch);

export default router;
