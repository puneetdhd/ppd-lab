import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IMark extends Document {
  student_id: Types.ObjectId;
  assignment_id: Types.ObjectId;
  midsem: number;     // max 20
  endsem: number;     // max 60
  quiz: number;       // max 10
  assignment: number; // max 10
  total: number;      // total out of 100: midsem(20)+endsem(60)+quiz(10)+assignment(10)
  grade: string;      // computed via grade rules
  createdAt: Date;
  updatedAt: Date;
}

const MarkSchema = new Schema<IMark>(
  {
    student_id:   { type: Schema.Types.ObjectId, ref: 'Student',            required: true },
    assignment_id:{ type: Schema.Types.ObjectId, ref: 'TeachingAssignment',  required: true },
    midsem:       { type: Number, required: true, min: 0, max: 20 },
    endsem:       { type: Number, required: true, min: 0, max: 60 },
    quiz:         { type: Number, required: true, min: 0, max: 20 },
    assignment:   { type: Number, required: true, min: 0, max: 10 },
    total:        { type: Number },
    grade:        { type: String },
  },
  { timestamps: true }
);

// One mark record per student per teaching assignment
MarkSchema.index({ student_id: 1, assignment_id: 1 }, { unique: true });

export const Mark = mongoose.model<IMark>('Mark', MarkSchema);
