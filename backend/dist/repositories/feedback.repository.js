"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.feedbackRepository = exports.FeedbackRepository = void 0;
const Feedback_model_1 = require("../models/Feedback.model");
const mongoose_1 = require("mongoose");
class FeedbackRepository {
    async create(data) {
        return Feedback_model_1.Feedback.create(data);
    }
    async findAll() {
        return Feedback_model_1.Feedback.find()
            .populate({ path: 'student_id', populate: { path: 'user_id', select: 'name' } })
            .populate({ path: 'teacher_id', populate: { path: 'user_id', select: 'name' } })
            .populate('subject_id', 'subject_name')
            .sort({ createdAt: -1 });
    }
    async findByTeacher(teacherId) {
        return Feedback_model_1.Feedback.find({ teacher_id: new mongoose_1.Types.ObjectId(teacherId) })
            .populate({ path: 'student_id', populate: { path: 'user_id', select: 'name' } })
            .populate('subject_id', 'subject_name')
            .sort({ createdAt: -1 });
    }
    async findByStudent(studentId) {
        return Feedback_model_1.Feedback.find({ student_id: new mongoose_1.Types.ObjectId(studentId) })
            .populate({ path: 'teacher_id', populate: { path: 'user_id', select: 'name' } })
            .populate('subject_id', 'subject_name')
            .sort({ createdAt: -1 });
    }
    async averageRatingByTeacher(teacherId) {
        const result = await Feedback_model_1.Feedback.aggregate([
            { $match: { teacher_id: new mongoose_1.Types.ObjectId(teacherId) } },
            { $group: { _id: null, avg: { $avg: '$rating' } } },
        ]);
        return result.length > 0 ? Math.round(result[0].avg * 100) / 100 : 0;
    }
}
exports.FeedbackRepository = FeedbackRepository;
exports.feedbackRepository = new FeedbackRepository();
