import { studentRepository } from '../repositories/student.repository';
import { userRepository } from '../repositories/user.repository';
import { batchRepository } from '../repositories/batch.repository';
import { AppError } from '../utils/AppError';

interface CreateStudentDTO {
  name: string;
  email: string;
  password: string;
  batch_id: string;
  semester: number;
}

export class StudentService {
  async createStudent(data: CreateStudentDTO) {
    const existing = await userRepository.findByEmail(data.email);
    if (existing) throw new AppError('Email already in use', 409);

    const batch = await batchRepository.findById(data.batch_id);
    if (!batch) throw new AppError('Batch not found', 404);

    const user = await userRepository.create({
      name: data.name,
      email: data.email,
      password: data.password,
      role: 'student',
    });

    const student = await studentRepository.create({
      user_id: String(user._id),
      batch_id: data.batch_id,
      semester: data.semester,
    });

    return studentRepository.findById(String(student._id));
  }

  async getAllStudents() {
    return studentRepository.findAll();
  }

  async getStudentById(id: string) {
    const student = await studentRepository.findById(id);
    if (!student) throw new AppError('Student not found', 404);
    return student;
  }

  async getStudentByUserId(userId: string) {
    const student = await studentRepository.findByUserId(userId);
    if (!student) throw new AppError('Student profile not found', 404);
    return student;
  }

  async getStudentsByBatch(batchId: string) {
    return studentRepository.findByBatch(batchId);
  }
}

export const studentService = new StudentService();
