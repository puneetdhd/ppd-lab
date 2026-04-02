"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.feedbackService = exports.FeedbackService = void 0;
const feedback_repository_1 = require("../repositories/feedback.repository");
const student_repository_1 = require("../repositories/student.repository");
const teacher_repository_1 = require("../repositories/teacher.repository");
const AppError_1 = require("../utils/AppError");
class FeedbackService {
    async submitFeedback(data) {
        const student = await student_repository_1.studentRepository.findByUserId(data.userId);
        if (!student)
            throw new AppError_1.AppError('Student profile not found', 404);
        return feedback_repository_1.feedbackRepository.create({
            student_id: String(student._id),
            teacher_id: data.teacher_id,
            subject_id: data.subject_id,
            rating: data.rating,
            comment: data.comment,
        });
    }
    async getAllFeedback() {
        return feedback_repository_1.feedbackRepository.findAll();
    }
    async getMyFeedbackAsStudent(userId) {
        const student = await student_repository_1.studentRepository.findByUserId(userId);
        if (!student)
            throw new AppError_1.AppError('Student profile not found', 404);
        return feedback_repository_1.feedbackRepository.findByStudent(String(student._id));
    }
    async getFeedbackForTeacher(userId) {
        const teacher = await teacher_repository_1.teacherRepository.findByUserId(userId);
        if (!teacher)
            throw new AppError_1.AppError('Teacher profile not found', 404);
        const feedbacks = await feedback_repository_1.feedbackRepository.findByTeacher(String(teacher._id));
        const avgRating = await feedback_repository_1.feedbackRepository.averageRatingByTeacher(String(teacher._id));
        return { feedbacks, average_rating: avgRating };
    }
}
exports.FeedbackService = FeedbackService;
exports.feedbackService = new FeedbackService();
