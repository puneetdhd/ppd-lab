import mongoose, { Document, Schema } from 'mongoose';

export interface ISubject extends Document {
  subject_name: string;
  credits: number;
  createdAt: Date;
  updatedAt: Date;
}

const SubjectSchema = new Schema<ISubject>(
  {
    subject_name: { type: String, required: true, unique: true, trim: true },
    credits: { type: Number, required: true, default: 3, min: 1, max: 6 },
  },
  { timestamps: true }
);

export const Subject = mongoose.model<ISubject>('Subject', SubjectSchema);
