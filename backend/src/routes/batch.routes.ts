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

router.use(verifyToken, requireRole('admin'));

router.post('/', createBatch);
router.get('/', getAllBatches);
router.get('/branch/:branchId', getBatchesByBranch);
router.get('/:id', getBatchById);
router.put('/:id', updateBatch);
router.delete('/:id', deleteBatch);

export default router;
