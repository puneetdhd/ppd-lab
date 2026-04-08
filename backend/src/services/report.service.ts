import { markRepository } from '../repositories/mark.repository';
import { studentRepository } from '../repositories/student.repository';
import { assignmentRepository } from '../repositories/assignment.repository';
import { AppError } from '../utils/AppError';
import { generateCSV } from '../utils/csv';

// Extra models for complex aggregations
import { Mark } from '../models/Mark.model';
import { TeachingAssignment } from '../models/TeachingAssignment.model';
import { Batch } from '../models/Batch.model';

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

  async teacherPerformance(teacherId: string) {
    const assignments = await TeachingAssignment.find({ teacher_id: teacherId }).populate('batch_id');
    const batchStats: Record<string, { totalMarksCount: number, beyondA: number, belowF: number }> = {};
    
    for (const a of assignments) {
      // @ts-ignore
      const graduationYear = a.batch_id?.graduation_year || 'Unknown';
      const label = `Batch ${graduationYear}`;
      
      if (!batchStats[label]) {
        batchStats[label] = { totalMarksCount: 0, beyondA: 0, belowF: 0 };
      }
      
      const marks = await Mark.find({ assignment_id: a._id });
      batchStats[label].totalMarksCount += marks.length;
      batchStats[label].beyondA += marks.filter(m => m.grade === 'O' || m.grade === 'A').length;
      batchStats[label].belowF += marks.filter(m => m.grade === 'F').length;
    }

    // Convert to array for Recharts
    return Object.keys(batchStats).sort().map(batch => ({
      batch,
      ...batchStats[batch]
    }));
  }

  async branchPerformance(branchId: string) {
    const batches = await Batch.find({ branch_id: branchId });
    const batchStats: Record<string, { totalMarksCount: number, beyondA: number, belowF: number }> = {};

    for (const b of batches) {
      const label = `Batch ${b.graduation_year}`;
      if (!batchStats[label]) {
        batchStats[label] = { totalMarksCount: 0, beyondA: 0, belowF: 0 };
      }
      
      const assignments = await TeachingAssignment.find({ batch_id: b._id });
      for (const a of assignments) {
        const marks = await Mark.find({ assignment_id: a._id });
        batchStats[label].totalMarksCount += marks.length;
        batchStats[label].beyondA += marks.filter(m => m.grade === 'O' || m.grade === 'A').length;
        batchStats[label].belowF += marks.filter(m => m.grade === 'F').length;
      }
    }

    // Convert to array for Recharts
    return Object.keys(batchStats).sort().map(batch => ({
      batch,
      ...batchStats[batch]
    }));
  }
}

export const reportService = new ReportService();
