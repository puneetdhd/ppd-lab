import { markRepository } from '../repositories/mark.repository';
import { assignmentRepository } from '../repositories/assignment.repository';
import { studentRepository } from '../repositories/student.repository';
import { calculateGrade } from '../utils/grades';
import { AppError } from '../utils/AppError';
import { Mark } from '../models/Mark.model';

interface MarkInput {
  student_id: string;
  assignment_id: string;
  mid: number;
  quiz: number;
  assignment: number;
  attendance: number;
}

export class MarkService {
  async enterMark(data: MarkInput) {
    const [assignment, student] = await Promise.all([
      assignmentRepository.findById(data.assignment_id),
      studentRepository.findById(data.student_id),
    ]);

    if (!assignment) throw new AppError('Teaching assignment not found', 404);
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

    const total = data.mid + data.quiz + data.assignment + data.attendance;
    const grade = calculateGrade(total);

    return markRepository.create({ ...data, total, grade });
  }

  async updateMark(
    id: string,
    data: Partial<Omit<MarkInput, 'student_id' | 'assignment_id'>>
  ) {
    const existing = await markRepository.findById(id);
    if (!existing) throw new AppError('Mark record not found', 404);

    const mid = data.mid ?? existing.mid;
    const quiz = data.quiz ?? existing.quiz;
    const assignment = data.assignment ?? existing.assignment;
    const attendance = data.attendance ?? existing.attendance;

    const total = mid + quiz + assignment + attendance;
    const grade = calculateGrade(total);

    return markRepository.updateById(id, { mid, quiz, assignment, attendance, total, grade });
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
}

export const markService = new MarkService();
