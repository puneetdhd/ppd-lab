import { markRepository } from '../repositories/mark.repository';
import { studentRepository } from '../repositories/student.repository';
import { assignmentRepository } from '../repositories/assignment.repository';
import { AppError } from '../utils/AppError';
import { generateCSV } from '../utils/csv';

export class ReportService {
  async subjectReport(assignmentId: string) {
    const assignment = await assignmentRepository.findById(assignmentId);
    if (!assignment) throw new AppError('Assignment not found', 404);

    const marks = (await markRepository.findByAssignment(assignmentId)) as any[];
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

  async subjectReportCSV(assignmentId: string): Promise<string> {
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
    return generateCSV(data, headers);
  }

  async batchReport(batchId: string) {
    const students = (await studentRepository.findByBatch(batchId)) as any[];
    const report: any[] = [];

    for (const student of students) {
      const marks = (await markRepository.findByStudent(String(student._id))) as any[];
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

  async gradeDistribution(assignmentId: string) {
    const assignment = await assignmentRepository.findById(assignmentId);
    if (!assignment) throw new AppError('Assignment not found', 404);

    const marks = await markRepository.findByAssignment(assignmentId);
    const dist: Record<string, number> = { O: 0, E: 0, A: 0, B: 0, C: 0, D: 0, F: 0 };
    marks.forEach((m) => {
      if (dist[m.grade] !== undefined) dist[m.grade]++;
    });

    return {
      assignment_id: assignmentId,
      total_students: marks.length,
      distribution: dist,
    };
  }
}

export const reportService = new ReportService();
