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
    const email    = `${data.regdNo}@edu.ppd`.toLowerCase();
    const password = data.regdNo.toLowerCase(); // lowercase to match email prefix

    const existing = await userRepository.findByEmail(email);
    if (existing) throw new AppError('Email already in use', 409);

    const user = await userRepository.create({ name: data.name, email, password, role: 'teacher' });
    const teacher = await teacherRepository.create({ user_id: String(user._id) });

    return teacherRepository.findById(String(teacher._id));
  }

  async getAllTeachers() {
    return teacherRepository.findAll();
  }

  async getTeachersPaginated(page: number, limit: number, search?: string) {
    return teacherRepository.findPaginated({ page, limit, search });
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

  async bulkCreateTeachers(rows: { name: string; regdNo: string }[]) {
    const results: { name: string; email: string; status: string }[] = [];

    for (const row of rows) {
      const name = row.name.trim();
      const regdNo = row.regdNo.trim();
      if (!name || !regdNo) {
        results.push({ name: name || '(empty)', email: '', status: 'Skipped — missing name or ID' });
        continue;
      }

      const email    = `${regdNo}@edu.ppd`.toLowerCase();
      const password = regdNo.toLowerCase(); // lowercase to match email prefix

      try {
        const existing = await userRepository.findByEmail(email);
        if (existing) {
          results.push({ name, email, status: 'Skipped — email already exists' });
          continue;
        }

        const user = await userRepository.create({ name, email, password, role: 'teacher' });
        await teacherRepository.create({ user_id: String(user._id) });
        results.push({ name, email, status: 'Created' });
      } catch (err: any) {
        results.push({ name, email, status: `Failed — ${err.message}` });
      }
    }

    return results;
  }
}

export const teacherService = new TeacherService();
