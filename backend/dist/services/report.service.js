"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportService = exports.ReportService = void 0;
const mark_repository_1 = require("../repositories/mark.repository");
const student_repository_1 = require("../repositories/student.repository");
const assignment_repository_1 = require("../repositories/assignment.repository");
const AppError_1 = require("../utils/AppError");
const csv_1 = require("../utils/csv");
class ReportService {
    async subjectReport(assignmentId) {
        const assignment = await assignment_repository_1.assignmentRepository.findById(assignmentId);
        if (!assignment)
            throw new AppError_1.AppError('Assignment not found', 404);
        const marks = (await mark_repository_1.markRepository.findByAssignment(assignmentId));
        return marks.map((m) => ({
            student_name: m.student_id?.user_id?.name ?? '',
            student_email: m.student_id?.user_id?.email ?? '',
            mid: m.mid,
            quiz: m.quiz,
            assignment: m.assignment,
            attendance: m.attendance,
            total: m.total,
            grade: m.grade,
        }));
    }
    async subjectReportCSV(assignmentId) {
        const data = await this.subjectReport(assignmentId);
        const headers = [
            'student_name',
            'student_email',
            'mid',
            'quiz',
            'assignment',
            'attendance',
            'total',
            'grade',
        ];
        return (0, csv_1.generateCSV)(data, headers);
    }
    async batchReport(batchId) {
        const students = (await student_repository_1.studentRepository.findByBatch(batchId));
        const report = [];
        for (const student of students) {
            const marks = (await mark_repository_1.markRepository.findByStudent(String(student._id)));
            report.push({
                student_name: student.user_id?.name ?? '',
                student_email: student.user_id?.email ?? '',
                semester: student.semester,
                subjects: marks.map((m) => ({
                    subject: m.assignment_id?.subject_id?.subject_name ?? '',
                    total: m.total,
                    grade: m.grade,
                })),
            });
        }
        return report;
    }
    async gradeDistribution(assignmentId) {
        const assignment = await assignment_repository_1.assignmentRepository.findById(assignmentId);
        if (!assignment)
            throw new AppError_1.AppError('Assignment not found', 404);
        const marks = await mark_repository_1.markRepository.findByAssignment(assignmentId);
        const dist = { O: 0, E: 0, A: 0, B: 0, C: 0, D: 0, F: 0 };
        marks.forEach((m) => {
            if (dist[m.grade] !== undefined)
                dist[m.grade]++;
        });
        return {
            assignment_id: assignmentId,
            total_students: marks.length,
            distribution: dist,
        };
    }
}
exports.ReportService = ReportService;
exports.reportService = new ReportService();
