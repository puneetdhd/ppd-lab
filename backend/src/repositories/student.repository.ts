import { Student, IStudent } from '../models/Student.model';

const populateStudent = [
  { path: 'user_id', select: 'name email' },
  { path: 'batch_id', populate: { path: 'branch_id', select: 'branch_name' } },
];

export class StudentRepository {
  async create(data: {
    user_id: string;
    batch_id: string;
    semester: number;
  }): Promise<IStudent> {
    return Student.create(data);
  }

  async findAll(): Promise<IStudent[]> {
    return Student.find().populate(populateStudent).sort({ createdAt: -1 });
  }

  async findById(id: string): Promise<IStudent | null> {
    return Student.findById(id).populate(populateStudent);
  }

  async findByUserId(userId: string): Promise<IStudent | null> {
    return Student.findOne({ user_id: userId }).populate(populateStudent);
  }

  async findByBatch(batchId: string): Promise<IStudent[]> {
    return Student.find({ batch_id: batchId }).populate({
      path: 'user_id',
      select: 'name email',
    });
  }

  async findByBatchAndSemester(batchId: string, semester: number): Promise<IStudent[]> {
    return Student.find({ batch_id: batchId, semester }).populate({
      path: 'user_id',
      select: 'name email',
    });
  }
}

export const studentRepository = new StudentRepository();
