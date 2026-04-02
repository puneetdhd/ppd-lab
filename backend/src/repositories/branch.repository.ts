import { Branch, IBranch } from '../models/Branch.model';

export class BranchRepository {
  async create(data: { branch_name: string }): Promise<IBranch> {
    return Branch.create(data);
  }

  async findAll(): Promise<IBranch[]> {
    return Branch.find().sort({ branch_name: 1 });
  }

  async findById(id: string): Promise<IBranch | null> {
    return Branch.findById(id);
  }

  async update(id: string, data: Partial<IBranch>): Promise<IBranch | null> {
    return Branch.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async delete(id: string): Promise<IBranch | null> {
    return Branch.findByIdAndDelete(id);
  }
}

export const branchRepository = new BranchRepository();
