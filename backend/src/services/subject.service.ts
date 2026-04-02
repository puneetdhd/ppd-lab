import { subjectRepository } from '../repositories/subject.repository';
import { AppError } from '../utils/AppError';

export class SubjectService {
  async createSubject(data: { subject_name: string; credits?: number }) {
    return subjectRepository.create(data);
  }

  async getAllSubjects() {
    return subjectRepository.findAll();
  }

  async getSubjectById(id: string) {
    const subject = await subjectRepository.findById(id);
    if (!subject) throw new AppError('Subject not found', 404);
    return subject;
  }

  async updateSubject(id: string, data: { subject_name?: string; credits?: number }) {
    const subject = await subjectRepository.update(id, data as any);
    if (!subject) throw new AppError('Subject not found', 404);
    return subject;
  }

  async deleteSubject(id: string) {
    const subject = await subjectRepository.delete(id);
    if (!subject) throw new AppError('Subject not found', 404);
    return { message: 'Subject deleted successfully' };
  }
}

export const subjectService = new SubjectService();
