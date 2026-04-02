"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markService = exports.MarkService = void 0;
const mark_repository_1 = require("../repositories/mark.repository");
const assignment_repository_1 = require("../repositories/assignment.repository");
const student_repository_1 = require("../repositories/student.repository");
const grades_1 = require("../utils/grades");
const AppError_1 = require("../utils/AppError");
class MarkService {
    async enterMark(data) {
        const [assignment, student] = await Promise.all([
            assignment_repository_1.assignmentRepository.findById(data.assignment_id),
            student_repository_1.studentRepository.findById(data.student_id),
        ]);
        if (!assignment)
            throw new AppError_1.AppError('Teaching assignment not found', 404);
        if (!student)
            throw new AppError_1.AppError('Student not found', 404);
        const existing = await mark_repository_1.markRepository.findByStudentAndAssignment(data.student_id, data.assignment_id);
        if (existing) {
            throw new AppError_1.AppError('Marks already entered for this student. Use PUT /api/marks/:id to update.', 409);
        }
        const total = data.mid + data.quiz + data.assignment + data.attendance;
        const grade = (0, grades_1.calculateGrade)(total);
        return mark_repository_1.markRepository.create({ ...data, total, grade });
    }
    async updateMark(id, data) {
        const existing = await mark_repository_1.markRepository.findById(id);
        if (!existing)
            throw new AppError_1.AppError('Mark record not found', 404);
        const mid = data.mid ?? existing.mid;
        const quiz = data.quiz ?? existing.quiz;
        const assignment = data.assignment ?? existing.assignment;
        const attendance = data.attendance ?? existing.attendance;
        const total = mid + quiz + assignment + attendance;
        const grade = (0, grades_1.calculateGrade)(total);
        return mark_repository_1.markRepository.updateById(id, { mid, quiz, assignment, attendance, total, grade });
    }
    async getStudentResults(userId) {
        const student = await student_repository_1.studentRepository.findByUserId(userId);
        if (!student)
            throw new AppError_1.AppError('Student profile not found', 404);
        return mark_repository_1.markRepository.findByStudent(String(student._id));
    }
    async getMarksByAssignment(assignmentId) {
        return mark_repository_1.markRepository.findByAssignment(assignmentId);
    }
}
exports.MarkService = MarkService;
exports.markService = new MarkService();
