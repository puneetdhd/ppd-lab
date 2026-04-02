import { Feedback, IFeedback } from '../models/Feedback.model';
import { Types } from 'mongoose';

export class FeedbackRepository {
  async create(data: {
    student_id: string;
    teacher_id: string;
    subject_id: string;
    rating: number;
    comment?: string;
  }): Promise<IFeedback> {
    return Feedback.create(data);
  }

  async findAll(): Promise<IFeedback[]> {
    return Feedback.find()
      .populate({ path: 'student_id', populate: { path: 'user_id', select: 'name' } })
      .populate({ path: 'teacher_id', populate: { path: 'user_id', select: 'name' } })
      .populate('subject_id', 'subject_name')
      .sort({ createdAt: -1 });
  }

  async findByTeacher(teacherId: string): Promise<IFeedback[]> {
    return Feedback.find({ teacher_id: new Types.ObjectId(teacherId) })
      .populate({ path: 'student_id', populate: { path: 'user_id', select: 'name' } })
      .populate('subject_id', 'subject_name')
      .sort({ createdAt: -1 });
  }

  async findByStudent(studentId: string): Promise<IFeedback[]> {
    return Feedback.find({ student_id: new Types.ObjectId(studentId) })
      .populate({ path: 'teacher_id', populate: { path: 'user_id', select: 'name' } })
      .populate('subject_id', 'subject_name')
      .sort({ createdAt: -1 });
  }

  async averageRatingByTeacher(teacherId: string): Promise<number> {
    const result = await Feedback.aggregate([
      { $match: { teacher_id: new Types.ObjectId(teacherId) } },
      { $group: { _id: null, avg: { $avg: '$rating' } } },
    ]);
    return result.length > 0 ? Math.round(result[0].avg * 100) / 100 : 0;
  }
}

export const feedbackRepository = new FeedbackRepository();
