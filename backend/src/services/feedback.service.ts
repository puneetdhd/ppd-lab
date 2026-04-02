import { feedbackRepository } from '../repositories/feedback.repository';
import { studentRepository } from '../repositories/student.repository';
import { teacherRepository } from '../repositories/teacher.repository';
import { AppError } from '../utils/AppError';

interface SubmitFeedbackDTO {
  userId: string;
  teacher_id: string;
  subject_id: string;
  rating: number;
  comment?: string;
}

export class FeedbackService {
  async submitFeedback(data: SubmitFeedbackDTO) {
    const student = await studentRepository.findByUserId(data.userId);
    if (!student) throw new AppError('Student profile not found', 404);

    return feedbackRepository.create({
      student_id: String(student._id),
      teacher_id: data.teacher_id,
      subject_id: data.subject_id,
      rating: data.rating,
      comment: data.comment,
    });
  }

  async getAllFeedback() {
    return feedbackRepository.findAll();
  }

  async getMyFeedbackAsStudent(userId: string) {
    const student = await studentRepository.findByUserId(userId);
    if (!student) throw new AppError('Student profile not found', 404);
    return feedbackRepository.findByStudent(String(student._id));
  }

  async getFeedbackForTeacher(userId: string) {
    const teacher = await teacherRepository.findByUserId(userId);
    if (!teacher) throw new AppError('Teacher profile not found', 404);
    const feedbacks = await feedbackRepository.findByTeacher(String(teacher._id));
    const avgRating = await feedbackRepository.averageRatingByTeacher(String(teacher._id));
    return { feedbacks, average_rating: avgRating };
  }
}

export const feedbackService = new FeedbackService();
