import { studentRepository } from '../repositories/student.repository';
import { userRepository } from '../repositories/user.repository';
import { batchRepository } from '../repositories/batch.repository';
import { AppError } from '../utils/AppError';
import { User } from '../models/User.model';
import { Student } from '../models/Student.model';

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

  async deleteStudent(id: string) {
    const student = await studentRepository.findById(id);
    if (!student) throw new AppError('Student not found', 404);

    const userId = (student as any).user_id?._id || student.user_id;
    await Student.findByIdAndDelete(id);
    if (userId) await User.findByIdAndDelete(userId);

    return { message: 'Student deleted successfully' };
  }

  async bulkCreateStudents(rows: { name: string; regdNo: string }[], batchId: string) {
    const batch = await batchRepository.findById(batchId);
    if (!batch) throw new AppError('Batch not found', 404);

    // Compute current semester from batch start year
    const yearDiff = new Date().getFullYear() - (batch as any).start_year;
    let semester = new Date().getMonth() >= 7 ? yearDiff * 2 + 1 : yearDiff * 2;
    if (semester < 1) semester = 1;
    if (semester > 8) semester = 8;

    const results: { name: string; email: string; status: string }[] = [];

    for (const row of rows) {
      const name = row.name.trim();
      const regdNo = row.regdNo.trim();
      if (!name || !regdNo) {
        results.push({ name: name || '(empty)', email: '', status: 'Skipped — missing name or regd no' });
        continue;
      }

      // Generate email: regdNo@edu.ppd
      const email = `${regdNo}@edu.ppd`;
      // Password = registration number
      const password = regdNo;

      try {
        const existing = await userRepository.findByEmail(email);
        if (existing) {
          results.push({ name, email, status: 'Skipped — email already exists' });
          continue;
        }

        const user = await userRepository.create({
          name,
          email,
          password,
          role: 'student',
        });

        await studentRepository.create({
          user_id: String(user._id),
          batch_id: batchId,
          semester,
        });

        results.push({ name, email, status: 'Created' });
      } catch (err: any) {
        results.push({ name, email, status: `Failed — ${err.message}` });
      }
    }

    return results;
  }
}

export const studentService = new StudentService();
