import { Router } from 'express';
import {
  createBatch,
  getAllBatches,
  getBatchById,
  getBatchesByBranch,
  updateBatch,
  deleteBatch,
} from '../controllers/batch.controller';
import { verifyToken } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

// Public GET — needed for registration dropdowns
router.get('/', getAllBatches);
router.get('/branch/:branchId', getBatchesByBranch);
router.get('/:id', getBatchById);

// Admin only — mutations
router.post('/', verifyToken, requireRole('admin'), createBatch);
router.put('/:id', verifyToken, requireRole('admin'), updateBatch);
router.delete('/:id', verifyToken, requireRole('admin'), deleteBatch);

export default router;
