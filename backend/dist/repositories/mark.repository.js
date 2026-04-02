"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markRepository = exports.MarkRepository = void 0;
const Mark_model_1 = require("../models/Mark.model");
class MarkRepository {
    async create(data) {
        return Mark_model_1.Mark.create(data);
    }
    async findByStudentAndAssignment(studentId, assignmentId) {
        return Mark_model_1.Mark.findOne({ student_id: studentId, assignment_id: assignmentId });
    }
    async findById(id) {
        return Mark_model_1.Mark.findById(id);
    }
    async updateById(id, data) {
        return Mark_model_1.Mark.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    }
    async findByStudent(studentId) {
        return Mark_model_1.Mark.find({ student_id: studentId }).populate({
            path: 'assignment_id',
            populate: [
                { path: 'subject_id', select: 'subject_name credits' },
                { path: 'batch_id', populate: { path: 'branch_id', select: 'branch_name' } },
                { path: 'teacher_id', populate: { path: 'user_id', select: 'name' } },
            ],
        });
    }
    async findByAssignment(assignmentId) {
        return Mark_model_1.Mark.find({ assignment_id: assignmentId }).populate({
            path: 'student_id',
            populate: { path: 'user_id', select: 'name email' },
        });
    }
}
exports.MarkRepository = MarkRepository;
exports.markRepository = new MarkRepository();
