import { batchRepository } from '../repositories/batch.repository';
import { branchRepository } from '../repositories/branch.repository';
import { AppError } from '../utils/AppError';

interface CreateBatchDTO {
  branch_id: string;
  start_year: number;
  graduation_year: number;
}

export class BatchService {
  async createBatch(data: CreateBatchDTO) {
    const branch = await branchRepository.findById(data.branch_id);
    if (!branch) throw new AppError('Branch not found', 404);
    if (data.graduation_year <= data.start_year) {
      throw new AppError('graduation_year must be greater than start_year', 400);
    }
    return batchRepository.create(data);
  }

  async getAllBatches() {
    return batchRepository.findAll();
  }

  async getBatchById(id: string) {
    const batch = await batchRepository.findById(id);
    if (!batch) throw new AppError('Batch not found', 404);
    return batch;
  }

  async getBatchesByBranch(branchId: string) {
    return batchRepository.findByBranch(branchId);
  }

  async updateBatch(id: string, data: Partial<CreateBatchDTO>) {
    const batch = await batchRepository.update(id, data);
    if (!batch) throw new AppError('Batch not found', 404);
    return batch;
  }

  async deleteBatch(id: string) {
    const batch = await batchRepository.delete(id);
    if (!batch) throw new AppError('Batch not found', 404);
    return { message: 'Batch deleted successfully' };
  }
}

export const batchService = new BatchService();
