"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analysisService = exports.AnalysisService = void 0;
const mark_repository_1 = require("../repositories/mark.repository");
const assignment_repository_1 = require("../repositories/assignment.repository");
const teacher_repository_1 = require("../repositories/teacher.repository");
const AppError_1 = require("../utils/AppError");
class AnalysisService {
    async getAnalysisByAssignment(assignmentId) {
        const assignment = await assignment_repository_1.assignmentRepository.findById(assignmentId);
        if (!assignment)
            throw new AppError_1.AppError('Assignment not found', 404);
        const marks = await mark_repository_1.markRepository.findByAssignment(assignmentId);
        const above90 = marks.filter((m) => m.total >= 90).length;
        const between50and90 = marks.filter((m) => m.total >= 50 && m.total < 90).length;
        const failed = marks.filter((m) => m.total < 50).length;
        const gradeDistribution = {
            O: 0, E: 0, A: 0, B: 0, C: 0, D: 0, F: 0,
        };
        marks.forEach((m) => {
            if (gradeDistribution[m.grade] !== undefined)
                gradeDistribution[m.grade]++;
        });
        const avgTotal = marks.length > 0
            ? Math.round((marks.reduce((s, m) => s + m.total, 0) / marks.length) * 100) / 100
            : 0;
        const a = assignment;
        const batchPop = a.batch_id;
        const branchName = batchPop?.branch_id?.branch_name ?? '';
        const batchLabel = `${branchName} ${batchPop?.start_year}–${batchPop?.graduation_year}`;
        return {
            assignment_id: assignmentId,
            subject: a.subject_id?.subject_name ?? '',
            batch: batchLabel,
            semester: assignment.semester,
            total_students: marks.length,
            above_90: above90,
            between_50_90: between50and90,
            failed,
            grade_distribution: gradeDistribution,
            average_total: avgTotal,
        };
    }
    async getTeacherAnalysis(userId) {
        const teacher = await teacher_repository_1.teacherRepository.findByUserId(userId);
        if (!teacher)
            throw new AppError_1.AppError('Teacher profile not found', 404);
        const assignments = await assignment_repository_1.assignmentRepository.findByTeacher(String(teacher._id));
        const results = await Promise.all(assignments.map((a) => this.getAnalysisByAssignment(String(a._id))));
        return results;
    }
}
exports.AnalysisService = AnalysisService;
exports.analysisService = new AnalysisService();
