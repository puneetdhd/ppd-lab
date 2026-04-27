import { markRepository } from '../repositories/mark.repository';
import { assignmentRepository } from '../repositories/assignment.repository';
import { teacherRepository } from '../repositories/teacher.repository';
import { AppError } from '../utils/AppError';

export class AnalysisService {
  async getAnalysisByAssignment(assignmentId: string) {
    const assignment = await assignmentRepository.findById(assignmentId);
    if (!assignment) throw new AppError('Assignment not found', 404);

    const marks = await markRepository.findByAssignment(assignmentId);

    const above90 = marks.filter((m) => m.total >= 90).length;
    const between50and90 = marks.filter((m) => m.total >= 50 && m.total < 90).length;
    const failed = marks.filter((m) => m.total < 50).length;

    const gradeDistribution: Record<string, number> = {
      O: 0, E: 0, A: 0, B: 0, C: 0, D: 0, F: 0,
    };
    marks.forEach((m) => {
      if (gradeDistribution[m.grade] !== undefined) gradeDistribution[m.grade]++;
    });

    const avgTotal =
      marks.length > 0
        ? Math.round((marks.reduce((s, m) => s + m.total, 0) / marks.length) * 100) / 100
        : 0;

    const a = assignment as any;
    const batchPop = a.batch_id;
    const branchName = batchPop?.branch_id?.branch_name ?? '';
    const batchLabel = `${branchName} ${batchPop?.start_year}–${batchPop?.graduation_year}`;

    return {
      assignment_id: assignmentId,
      subject: a.subject_id?.subject_name ?? '',
      teacher: a.teacher_id?.user_id?.name ?? '',
      batch: batchLabel,
      branch_name: branchName,
      start_year: batchPop?.start_year ?? null,
      graduation_year: batchPop?.graduation_year ?? null,
      semester: assignment.semester,
      total_students: marks.length,
      above_90: above90,
      between_50_90: between50and90,
      failed,
      grade_distribution: gradeDistribution,
      average_total: avgTotal,
    };
  }

  async getTeacherAnalysis(userId: string) {
    const teacher = await teacherRepository.findByUserId(userId);
    if (!teacher) throw new AppError('Teacher profile not found', 404);

    const assignments = await assignmentRepository.findByTeacher(String(teacher._id));
    const results = await Promise.all(
      assignments.map((a) => this.getAnalysisByAssignment(String(a._id)))
    );
    return results;
  }

  async getAllAnalysis() {
    const assignments = await assignmentRepository.findAll();
    const results = await Promise.all(
      assignments.map((a) => this.getAnalysisByAssignment(String(a._id)))
    );
    return results.filter((r) => r.total_students > 0);
  }
}

export const analysisService = new AnalysisService();
