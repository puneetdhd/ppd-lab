import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ITeachingAssignment extends Document {
  teacher_id: Types.ObjectId;
  subject_id: Types.ObjectId;
  batch_id: Types.ObjectId;
  semester: number;
  createdAt: Date;
  updatedAt: Date;
}

const TeachingAssignmentSchema = new Schema<ITeachingAssignment>(
  {
    teacher_id: { type: Schema.Types.ObjectId, ref: 'Teacher', required: true },
    subject_id: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    batch_id: { type: Schema.Types.ObjectId, ref: 'Batch', required: true },
    semester: { type: Number, required: true, min: 1, max: 8 },
  },
  { timestamps: true }
);

// Prevent duplicate assignments: same teacher, subject, batch, semester
TeachingAssignmentSchema.index(
  { teacher_id: 1, subject_id: 1, batch_id: 1, semester: 1 },
  { unique: true }
);

export const TeachingAssignment = mongoose.model<ITeachingAssignment>(
  'TeachingAssignment',
  TeachingAssignmentSchema
);
