import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IStudent extends Document {
  user_id: Types.ObjectId;
  batch_id: Types.ObjectId;
  semester: number;
  createdAt: Date;
  updatedAt: Date;
}

const StudentSchema = new Schema<IStudent>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    batch_id: { type: Schema.Types.ObjectId, ref: 'Batch', required: true },
    semester: { type: Number, required: true, min: 1, max: 8 },
  },
  { timestamps: true }
);

export const Student = mongoose.model<IStudent>('Student', StudentSchema);
