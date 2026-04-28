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

  async findPaginated(opts: {
    page: number;
    limit: number;
    search?: string;
  }): Promise<{ data: IStudent[]; total: number }> {
    const { page, limit, search } = opts;
    const filter: any = {};

    if (search) {
      // search by name or email via join on user_id
      const users = await (await import('../models/User.model')).User.find({
        $or: [
          { name:  { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      }, '_id').lean();
      filter.user_id = { $in: users.map((u: any) => u._id) };
    }

    const [data, total] = await Promise.all([
      Student.find(filter)
        .populate(populateStudent)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Student.countDocuments(filter),
    ]);

    return { data, total };
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
