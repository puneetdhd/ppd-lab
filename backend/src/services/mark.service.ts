import { markRepository } from '../repositories/mark.repository';
import { assignmentRepository } from '../repositories/assignment.repository';
import { studentRepository } from '../repositories/student.repository';
import { userRepository } from '../repositories/user.repository';
import { calculateGrade } from '../utils/grades';
import { AppError } from '../utils/AppError';
import { Mark } from '../models/Mark.model';

interface MarkInput {
  student_id: string;
  assignment_id: string;
  midsem: number;
  endsem: number;
  quiz: number;
  assignment: number;
}

function computeTotal(midsem: number, endsem: number, quiz: number, assignment: number): number {
  // Now out of 100 (20 + 60 + 10 + 10)
  const raw = midsem + endsem + quiz + assignment;
  return Math.round(raw * 100) / 100;
}

export class MarkService {
  async enterMark(data: MarkInput) {
    const [teachingAssignment, student] = await Promise.all([
      assignmentRepository.findById(data.assignment_id),
      studentRepository.findById(data.student_id),
    ]);

    if (!teachingAssignment) throw new AppError('Teaching assignment not found', 404);
    if (!student) throw new AppError('Student not found', 404);

    const existing = await markRepository.findByStudentAndAssignment(
      data.student_id,
      data.assignment_id
    );
    if (existing) {
      throw new AppError(
        'Marks already entered for this student. Use PUT /api/marks/:id to update.',
        409
      );
    }

    const total = computeTotal(data.midsem, data.endsem, data.quiz, data.assignment);
    const grade = calculateGrade(total);

    return markRepository.create({ ...data, total, grade });
  }

  async updateMark(
    id: string,
    data: Partial<Omit<MarkInput, 'student_id' | 'assignment_id'>>
  ) {
    const existing = await markRepository.findById(id);
    if (!existing) throw new AppError('Mark record not found', 404);

    const midsem     = data.midsem     ?? existing.midsem;
    const endsem     = data.endsem     ?? existing.endsem;
    const quiz       = data.quiz       ?? existing.quiz;
    const assignment = data.assignment ?? existing.assignment;

    const total = computeTotal(midsem, endsem, quiz, assignment);
    const grade = calculateGrade(total);

    return markRepository.updateById(id, { midsem, endsem, quiz, assignment, total, grade });
  }

  async deleteMark(id: string) {
    const mark = await markRepository.findById(id);
    if (!mark) throw new AppError('Mark record not found', 404);
    await Mark.findByIdAndDelete(id);
    return { message: 'Mark deleted successfully' };
  }

  async getStudentResults(userId: string) {
    const student = await studentRepository.findByUserId(userId);
    if (!student) throw new AppError('Student profile not found', 404);
    return markRepository.findByStudent(String(student._id));
  }

  async getMarksByAssignment(assignmentId: string) {
    return markRepository.findByAssignment(assignmentId);
  }

  /**
   * Bulk import marks from CSV rows.
   * Each row: regdNo, studentName, midsem, endsem, quiz, assignment
   *
   * Matching strategy (in order):
   *   1. Exact email match:  regdNo@edu.ppd
   *   2. Name match (case-insensitive) within the batch
   *
   * All students in the batch are pre-loaded once; no per-row DB queries.
   * Existing marks are UPDATED; new marks are CREATED.
   */
  async bulkImportMarks(
    assignmentId: string,
    rows: { regdNo: string; name?: string; midsem: number; endsem: number; quiz: number; assignment: number }[]
  ) {
    const teachingAssignment = await assignmentRepository.findById(assignmentId);
    if (!teachingAssignment) throw new AppError('Teaching assignment not found', 404);

    const batchId = (teachingAssignment as any).batch_id?._id
      || (teachingAssignment as any).batch_id;

    // ── Pre-load all students in this batch once ────────────────────────────
    const batchStudents = await studentRepository.findByBatch(String(batchId));

    // Build a fast-lookup map: email → student
    const emailToStudent = new Map<string, any>();
    const nameLower = new Map<string, any>();

    for (const s of batchStudents) {
      const email = (s as any).user_id?.email?.toLowerCase();
      if (email) emailToStudent.set(email, s);
      const name  = (s as any).user_id?.name?.toLowerCase().trim();
      if (name)  nameLower.set(name, s);
    }

    // Pre-load existing marks for this assignment once
    const existingMarks = await markRepository.findByAssignment(assignmentId);
    const studentIdToMark = new Map<string, any>();
    for (const m of existingMarks) {
      const sid = (m as any).student_id?._id?.toString() || (m as any).student_id?.toString();
      if (sid) studentIdToMark.set(sid, m);
    }

    // ── Process rows ────────────────────────────────────────────────────────
    const results: { regdNo: string; name: string; status: string }[] = [];

    for (const row of rows) {
      const regdNo = (row.regdNo || '').trim();
      const rowName = (row.name || '').trim();

      if (!regdNo && !rowName) {
        results.push({ regdNo: '(empty)', name: '', status: 'Skipped — missing registration number and name' });
        continue;
      }

      try {
        // Strategy 1: email lookup
        let student: any = null;
        if (regdNo) {
          student = emailToStudent.get(`${regdNo.toLowerCase()}@edu.ppd`);
        }
        // Strategy 2: name lookup within batch
        if (!student && rowName) {
          student = nameLower.get(rowName.toLowerCase());
        }

        if (!student) {
          results.push({ regdNo, name: rowName, status: 'Skipped — student not found in this batch' });
          continue;
        }

        const studentId = String(student._id);
        const resolvedName = (student as any).user_id?.name || rowName;

        const midsem     = Math.min(Number(row.midsem) || 0, 20);
        const endsem     = Math.min(Number(row.endsem) || 0, 60);
        const quiz       = Math.min(Number(row.quiz) || 0, 10);
        const assignment = Math.min(Number(row.assignment) || 0, 10);

        const total = computeTotal(midsem, endsem, quiz, assignment);
        const grade = calculateGrade(total);

        const existing = studentIdToMark.get(studentId);

        if (existing) {
          await markRepository.updateById(String(existing._id), {
            midsem, endsem, quiz, assignment, total, grade,
          });
          results.push({ regdNo, name: resolvedName, status: 'Updated' });
        } else {
          await markRepository.create({
            student_id: studentId,
            assignment_id: assignmentId,
            midsem, endsem, quiz, assignment, total, grade,
          });
          results.push({ regdNo, name: resolvedName, status: 'Created' });
        }
      } catch (err: any) {
        results.push({ regdNo, name: rowName, status: `Failed — ${err.message}` });
      }
    }

    return results;
  }
}

export const markService = new MarkService();
