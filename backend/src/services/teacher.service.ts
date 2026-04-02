import { teacherRepository } from '../repositories/teacher.repository';
import { userRepository } from '../repositories/user.repository';
import { AppError } from '../utils/AppError';

interface CreateTeacherDTO {
  name: string;
  email: string;
  password: string;
}

export class TeacherService {
  async createTeacher(data: CreateTeacherDTO) {
    const existing = await userRepository.findByEmail(data.email);
    if (existing) throw new AppError('Email already in use', 409);

    const user = await userRepository.create({ ...data, role: 'teacher' });
    const teacher = await teacherRepository.create({ user_id: String(user._id) });

    // Return populated teacher
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
}

export const teacherService = new TeacherService();
