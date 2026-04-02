import { Batch, IBatch } from '../models/Batch.model';
import { Types } from 'mongoose';

const populateBranch = { path: 'branch_id', select: 'branch_name' };

export class BatchRepository {
  async create(data: {
    branch_id: string;
    start_year: number;
    graduation_year: number;
  }): Promise<IBatch> {
    return Batch.create(data);
  }

  async findAll(): Promise<IBatch[]> {
    return Batch.find().populate(populateBranch).sort({ start_year: -1 });
  }

  async findById(id: string): Promise<IBatch | null> {
    return Batch.findById(id).populate(populateBranch);
  }

  async findByBranch(branchId: string): Promise<IBatch[]> {
    return Batch.find({ branch_id: new Types.ObjectId(branchId) }).populate(populateBranch);
  }

  async update(
    id: string,
    data: Partial<{ branch_id: string; start_year: number; graduation_year: number }>
  ): Promise<IBatch | null> {
    return Batch.findByIdAndUpdate(id, data, { new: true, runValidators: true }).populate(
      populateBranch
    );
  }

  async delete(id: string): Promise<IBatch | null> {
    return Batch.findByIdAndDelete(id);
  }
}

export const batchRepository = new BatchRepository();
