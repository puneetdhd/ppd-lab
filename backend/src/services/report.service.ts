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
    const gradeKeys = ['O', 'A', 'B', 'C', 'D', 'E', 'F'] as const;
    const batchStats: Record<string, { totalMarksCount: number, gradeO: number, gradeA: number, gradeB: number, gradeC: number, gradeD: number, gradeE: number, gradeF: number }> = {};
    
    for (const a of assignments) {
      // @ts-ignore
      const graduationYear = a.batch_id?.graduation_year || 'Unknown';
      const label = `Batch ${graduationYear}`;
      
      if (!batchStats[label]) {
        batchStats[label] = { totalMarksCount: 0, gradeO: 0, gradeA: 0, gradeB: 0, gradeC: 0, gradeD: 0, gradeE: 0, gradeF: 0 };
      }
      
      const marks = await Mark.find({ assignment_id: a._id });
      batchStats[label].totalMarksCount += marks.length;
      for (const g of gradeKeys) {
        const count = marks.filter(m => m.grade === g).length;
        (batchStats[label] as any)[`grade${g}`] += count;
      }
    }

    // Convert to array for Recharts
    return Object.keys(batchStats).sort().map(batch => ({
      batch,
      ...batchStats[batch]
    }));
  }

  async branchPerformance(branchId: string) {
    const batches = await Batch.find({ branch_id: branchId });
    const gradeKeys = ['O', 'A', 'B', 'C', 'D', 'E', 'F'] as const;
    const batchStats: Record<string, { totalMarksCount: number, gradeO: number, gradeA: number, gradeB: number, gradeC: number, gradeD: number, gradeE: number, gradeF: number }> = {};

    for (const b of batches) {
      const label = `Batch ${b.graduation_year}`;
      if (!batchStats[label]) {
        batchStats[label] = { totalMarksCount: 0, gradeO: 0, gradeA: 0, gradeB: 0, gradeC: 0, gradeD: 0, gradeE: 0, gradeF: 0 };
      }
      
      const assignments = await TeachingAssignment.find({ batch_id: b._id });
      for (const a of assignments) {
        const marks = await Mark.find({ assignment_id: a._id });
        batchStats[label].totalMarksCount += marks.length;
        for (const g of gradeKeys) {
          const count = marks.filter(m => m.grade === g).length;
          (batchStats[label] as any)[`grade${g}`] += count;
        }
      }
    }

    // Convert to array for Recharts
    return Object.keys(batchStats).sort().map(batch => ({
      batch,
      ...batchStats[batch]
    }));
  }

  async batchTeachersPerformance(batchId: string) {
    const assignments = await TeachingAssignment.find({ batch_id: batchId })
      .populate({ path: 'teacher_id', populate: { path: 'user_id', select: 'name' } })
      .populate('subject_id');
    
    const gradeKeys = ['O', 'A', 'B', 'C', 'D', 'E', 'F'] as const;
    type GradeStats = { totalMarksCount: number, gradeO: number, gradeA: number, gradeB: number, gradeC: number, gradeD: number, gradeE: number, gradeF: number };
    const teacherStats: Record<string, GradeStats> = {};

    for (const a of assignments) {
      // @ts-ignore
      const teacherName = a.teacher_id?.user_id?.name || 'Unknown';
      
      if (!teacherStats[teacherName]) {
        teacherStats[teacherName] = { totalMarksCount: 0, gradeO: 0, gradeA: 0, gradeB: 0, gradeC: 0, gradeD: 0, gradeE: 0, gradeF: 0 };
      }

      const marks = await Mark.find({ assignment_id: a._id });
      teacherStats[teacherName].totalMarksCount += marks.length;
      for (const g of gradeKeys) {
        const count = marks.filter(m => m.grade === g).length;
        (teacherStats[teacherName] as any)[`grade${g}`] += count;
      }
    }

    return Object.keys(teacherStats).sort().map(teacher => ({
      teacher,
      ...teacherStats[teacher]
    }));
  }
}

export const reportService = new ReportService();
