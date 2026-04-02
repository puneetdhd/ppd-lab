import { Teacher, ITeacher } from '../models/Teacher.model';

export class TeacherRepository {
  async create(data: { user_id: string }): Promise<ITeacher> {
    return Teacher.create(data);
  }

  async findAll(): Promise<ITeacher[]> {
    return Teacher.find().populate('user_id', 'name email');
  }

  async findById(id: string): Promise<ITeacher | null> {
    return Teacher.findById(id).populate('user_id', 'name email');
  }

  async findByUserId(userId: string): Promise<ITeacher | null> {
    return Teacher.findOne({ user_id: userId }).populate('user_id', 'name email');
  }
}

export const teacherRepository = new TeacherRepository();
