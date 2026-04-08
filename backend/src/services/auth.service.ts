import jwt from 'jsonwebtoken';
import { userRepository } from '../repositories/user.repository';
import { teacherRepository } from '../repositories/teacher.repository';
import { studentRepository } from '../repositories/student.repository';
import { batchRepository } from '../repositories/batch.repository';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';

export class AuthService {
  async login(email: string, password: string) {
    const user = await userRepository.findByEmail(email);
    if (!user) throw new AppError('Invalid email or password', 401);

    const isValid = await user.comparePassword(password);
    if (!isValid) throw new AppError('Invalid email or password', 401);

    const token = jwt.sign(
      { user_id: String(user._id), role: user.role },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN as any }
    );

    return {
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    };
  }

  async registerStudent(data: {
    name: string;
    email: string;
    password: string;
    batch_id: string;
    semester: number;
  }) {
    const existing = await userRepository.findByEmail(data.email);
    if (existing) throw new AppError('Email is already registered', 400);

    const batch = await batchRepository.findById(data.batch_id);
    if (!batch) throw new AppError('Invalid batch selected', 404);

    const user = await userRepository.create({
      name: data.name,
      email: data.email,
      password: data.password,
      role: 'student',
    });

    await studentRepository.create({
      user_id: String(user._id),
      batch_id: data.batch_id,
      semester: data.semester,
    });

    const token = jwt.sign(
      { user_id: String(user._id), role: user.role },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN as any }
    );

    return {
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    };
  }

  async registerTeacher(data: { name: string; email: string; password: string }) {
    const existing = await userRepository.findByEmail(data.email);
    if (existing) throw new AppError('Email is already registered', 400);

    const user = await userRepository.create({ ...data, role: 'teacher' });
    await teacherRepository.create({ user_id: String(user._id) });

    const token = jwt.sign(
      { user_id: String(user._id), role: user.role },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN as any }
    );

    return {
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    };
  }

  async createAdmin(data: { name: string; email: string; password: string }) {
    const existing = await userRepository.findByEmail(data.email);
    if (existing) throw new AppError('Email is already registered', 400);

    const user = await userRepository.create({ ...data, role: 'admin' });

    return { id: user._id, name: user.name, email: user.email, role: user.role };
  }
}

export const authService = new AuthService();
