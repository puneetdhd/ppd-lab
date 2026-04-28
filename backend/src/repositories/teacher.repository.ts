import { Teacher, ITeacher } from '../models/Teacher.model';

export class TeacherRepository {
  async create(data: { user_id: string }): Promise<ITeacher> {
    return Teacher.create(data);
  }

  async findAll(): Promise<ITeacher[]> {
    return Teacher.find().populate('user_id', 'name email');
  }

  async findPaginated(opts: {
    page: number;
    limit: number;
    search?: string;
  }): Promise<{ data: ITeacher[]; total: number }> {
    const { page, limit, search } = opts;
    const filter: any = {};

    if (search) {
      const { User } = await import('../models/User.model');
      const users = await User.find({
        $or: [
          { name:  { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      }, '_id').lean();
      filter.user_id = { $in: users.map((u: any) => u._id) };
    }

    const [data, total] = await Promise.all([
      Teacher.find(filter)
        .populate('user_id', 'name email')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Teacher.countDocuments(filter),
    ]);

    return { data, total };
  }

  async findById(id: string): Promise<ITeacher | null> {
    return Teacher.findById(id).populate('user_id', 'name email');
  }

  async findByUserId(userId: string): Promise<ITeacher | null> {
    return Teacher.findOne({ user_id: userId }).populate('user_id', 'name email');
  }
}

export const teacherRepository = new TeacherRepository();
