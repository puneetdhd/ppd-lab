import { branchRepository } from '../repositories/branch.repository';
import { AppError } from '../utils/AppError';

export class BranchService {
  async createBranch(branch_name: string) {
    return branchRepository.create({ branch_name });
  }

  async getAllBranches() {
    return branchRepository.findAll();
  }

  async getBranchById(id: string) {
    const branch = await branchRepository.findById(id);
    if (!branch) throw new AppError('Branch not found', 404);
    return branch;
  }

  async updateBranch(id: string, branch_name: string) {
    const branch = await branchRepository.update(id, { branch_name } as any);
    if (!branch) throw new AppError('Branch not found', 404);
    return branch;
  }

  async deleteBranch(id: string) {
    const branch = await branchRepository.delete(id);
    if (!branch) throw new AppError('Branch not found', 404);
    return { message: 'Branch deleted successfully' };
  }
}

export const branchService = new BranchService();
