import { teacherRepository } from '../repositories/teacher.repository';
import { userRepository } from '../repositories/user.repository';
import { AppError } from '../utils/AppError';
import { User } from '../models/User.model';
import { Teacher } from '../models/Teacher.model';

interface CreateTeacherDTO {
  name: string;
  regdNo: string;
}

export class TeacherService {
  async createTeacher(data: CreateTeacherDTO) {
    const email = `${data.regdNo}@edu.ppd`;
    const password = data.regdNo;

    const existing = await userRepository.findByEmail(email);
    if (existing) throw new AppError('Email already in use', 409);

    const user = await userRepository.create({ name: data.name, email, password, role: 'teacher' });
    const teacher = await teacherRepository.create({ user_id: String(user._id) });

    return teacherRepository.findById(String(teacher._id));
  }

  async getAllTeachers() {
    return teacherRepository.findAll();
  }

  async getTeacherById(id: string) {
    const teacher = await teacherRepository.findById(id);
    if (!teacher) throw new AppError('Teacher not found', 404);
    return teacher;
  }

  async getTeacherByUserId(userId: string) {
    const teacher = await teacherRepository.findByUserId(userId);
    if (!teacher) throw new AppError('Teacher profile not found', 404);
    return teacher;
  }

  async deleteTeacher(id: string) {
    const teacher = await teacherRepository.findById(id);
    if (!teacher) throw new AppError('Teacher not found', 404);

    const userId = (teacher as any).user_id?._id || teacher.user_id;
    await Teacher.findByIdAndDelete(id);
    if (userId) await User.findByIdAndDelete(userId);

    return { message: 'Teacher deleted successfully' };
  }
}

export const teacherService = new TeacherService();
