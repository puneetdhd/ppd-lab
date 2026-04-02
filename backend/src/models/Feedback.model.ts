import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IFeedback extends Document {
  student_id: Types.ObjectId;
  teacher_id: Types.ObjectId;
  subject_id: Types.ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

const FeedbackSchema = new Schema<IFeedback>(
  {
    student_id: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    teacher_id: { type: Schema.Types.ObjectId, ref: 'Teacher', required: true },
    subject_id: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

export const Feedback = mongoose.model<IFeedback>('Feedback', FeedbackSchema);
