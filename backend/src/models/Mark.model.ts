import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IMark extends Document {
  student_id: Types.ObjectId;
  assignment_id: Types.ObjectId;
  mid: number;        // max 60
  quiz: number;       // max 15
  assignment: number; // max 15
  attendance: number; // max 10
  total: number;      // computed: mid + quiz + assignment + attendance (max 100)
  grade: string;      // computed via grade rules
  createdAt: Date;
  updatedAt: Date;
}

const MarkSchema = new Schema<IMark>(
  {
    student_id: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    assignment_id: { type: Schema.Types.ObjectId, ref: 'TeachingAssignment', required: true },
    mid: { type: Number, required: true, min: 0, max: 60 },
    quiz: { type: Number, required: true, min: 0, max: 15 },
    assignment: { type: Number, required: true, min: 0, max: 15 },
    attendance: { type: Number, required: true, min: 0, max: 10 },
    total: { type: Number },
    grade: { type: String },
  },
  { timestamps: true }
);

// One mark record per student per teaching assignment
MarkSchema.index({ student_id: 1, assignment_id: 1 }, { unique: true });

export const Mark = mongoose.model<IMark>('Mark', MarkSchema);
