import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IBatch extends Document {
  branch_id: Types.ObjectId;
  start_year: number;
  graduation_year: number;
  createdAt: Date;
  updatedAt: Date;
}

const BatchSchema = new Schema<IBatch>(
  {
    branch_id: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
    start_year: { type: Number, required: true },
    graduation_year: { type: Number, required: true },
  },
  { timestamps: true }
);

export const Batch = mongoose.model<IBatch>('Batch', BatchSchema);
