import { TeachingAssignment, ITeachingAssignment } from '../models/TeachingAssignment.model';

const populateAssignment = [
  { path: 'teacher_id', populate: { path: 'user_id', select: 'name email' } },
  { path: 'subject_id', select: 'subject_name credits' },
  { path: 'batch_id', populate: { path: 'branch_id', select: 'branch_name' } },
];

export class AssignmentRepository {
  async create(data: {
    teacher_id: string;
    subject_id: string;
    batch_id: string;
    semester: number;
  }): Promise<ITeachingAssignment> {
    return TeachingAssignment.create(data);
  }

  async findAll(): Promise<ITeachingAssignment[]> {
    return TeachingAssignment.find().populate(populateAssignment).sort({ createdAt: -1 });
  }

  async findById(id: string): Promise<ITeachingAssignment | null> {
    return TeachingAssignment.findById(id).populate(populateAssignment);
  }

  async findByTeacher(teacherId: string): Promise<ITeachingAssignment[]> {
    return TeachingAssignment.find({ teacher_id: teacherId })
      .populate({ path: 'subject_id', select: 'subject_name credits' })
      .populate({ path: 'batch_id', populate: { path: 'branch_id', select: 'branch_name' } });
  }

  async findByBatchAndSemester(
    batchId: string,
    semester: number
  ): Promise<ITeachingAssignment[]> {
    return TeachingAssignment.find({ batch_id: batchId, semester })
      .populate({ path: 'teacher_id', populate: { path: 'user_id', select: 'name' } })
      .populate('subject_id', 'subject_name');
  }
}

export const assignmentRepository = new AssignmentRepository();
