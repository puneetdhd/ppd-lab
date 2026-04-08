import { assignmentRepository } from '../repositories/assignment.repository';
import { teacherRepository } from '../repositories/teacher.repository';
import { studentRepository } from '../repositories/student.repository';
import { subjectRepository } from '../repositories/subject.repository';
import { batchRepository } from '../repositories/batch.repository';
import { AppError } from '../utils/AppError';

interface AssignTeacherDTO {
  teacher_id: string;
  subject_id: string;
  batch_id: string;
  semester: number;
}

export class AssignmentService {
  async assignTeacher(data: AssignTeacherDTO) {
    const [teacher, subject, batch] = await Promise.all([
      teacherRepository.findById(data.teacher_id),
      subjectRepository.findById(data.subject_id),
      batchRepository.findById(data.batch_id),
    ]);

    if (!teacher) throw new AppError('Teacher not found', 404);
    if (!subject) throw new AppError('Subject not found', 404);
    if (!batch) throw new AppError('Batch not found', 404);

    return assignmentRepository.create(data);
  }

  async getAllAssignments() {
    return assignmentRepository.findAll();
  }

  async getAssignmentById(id: string) {
    const assignment = await assignmentRepository.findById(id);
    if (!assignment) throw new AppError('Teaching assignment not found', 404);
    return assignment;
  }

  async getMyAssignments(userId: string) {
    const teacher = await teacherRepository.findByUserId(userId);
    if (!teacher) throw new AppError('Teacher profile not found', 404);
    return assignmentRepository.findByTeacher(String(teacher._id));
  }

  async getAssignmentsByBatchSemester(batchId: string, semester: number) {
    return assignmentRepository.findByBatchAndSemester(batchId, semester);
  }

  async getStudentAssignments(userId: string) {
    const student = await studentRepository.findByUserId(userId);
    if (!student) throw new AppError('Student profile not found', 404);
    return assignmentRepository.findByBatchAndSemester(
      String(student.batch_id),
      student.semester
    );
  }
}

export const assignmentService = new AssignmentService();
