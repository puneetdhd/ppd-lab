import mongoose, { Document, Schema } from 'mongoose';

export interface IBranch extends Document {
  branch_name: string;
  createdAt: Date;
  updatedAt: Date;
}

const BranchSchema = new Schema<IBranch>(
  {
    branch_name: { type: String, required: true, unique: true, trim: true },
  },
  { timestamps: true }
);

export const Branch = mongoose.model<IBranch>('Branch', BranchSchema);
