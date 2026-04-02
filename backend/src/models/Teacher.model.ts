import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ITeacher extends Document {
  user_id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TeacherSchema = new Schema<ITeacher>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  },
  { timestamps: true }
);

export const Teacher = mongoose.model<ITeacher>('Teacher', TeacherSchema);
