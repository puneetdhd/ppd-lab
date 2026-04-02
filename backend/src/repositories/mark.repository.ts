import { Mark, IMark } from '../models/Mark.model';

interface CreateMarkData {
  student_id: string;
  assignment_id: string;
  mid: number;
  quiz: number;
  assignment: number;
  attendance: number;
  total: number;
  grade: string;
}

interface UpdateMarkData {
  mid?: number;
  quiz?: number;
  assignment?: number;
  attendance?: number;
  total?: number;
  grade?: string;
}

export class MarkRepository {
  async create(data: CreateMarkData): Promise<IMark> {
    return Mark.create(data);
  }

  async findByStudentAndAssignment(
    studentId: string,
    assignmentId: string
  ): Promise<IMark | null> {
    return Mark.findOne({ student_id: studentId, assignment_id: assignmentId });
  }

  async findById(id: string): Promise<IMark | null> {
    return Mark.findById(id);
  }

  async updateById(id: string, data: UpdateMarkData): Promise<IMark | null> {
    return Mark.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async findByStudent(studentId: string): Promise<IMark[]> {
    return Mark.find({ student_id: studentId }).populate({
      path: 'assignment_id',
      populate: [
        { path: 'subject_id', select: 'subject_name credits' },
        { path: 'batch_id', populate: { path: 'branch_id', select: 'branch_name' } },
        { path: 'teacher_id', populate: { path: 'user_id', select: 'name' } },
      ],
    });
  }

  async findByAssignment(assignmentId: string): Promise<IMark[]> {
    return Mark.find({ assignment_id: assignmentId }).populate({
      path: 'student_id',
      populate: { path: 'user_id', select: 'name email' },
    });
  }
}

export const markRepository = new MarkRepository();
