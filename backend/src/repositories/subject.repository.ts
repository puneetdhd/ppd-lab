import { Subject, ISubject } from '../models/Subject.model';

export class SubjectRepository {
  async create(data: { subject_name: string; credits?: number }): Promise<ISubject> {
    return Subject.create(data);
  }

  async findAll(): Promise<ISubject[]> {
    return Subject.find().sort({ subject_name: 1 });
  }

  async findById(id: string): Promise<ISubject | null> {
    return Subject.findById(id);
  }

  async update(id: string, data: Partial<ISubject>): Promise<ISubject | null> {
    return Subject.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async delete(id: string): Promise<ISubject | null> {
    return Subject.findByIdAndDelete(id);
  }
}

export const subjectRepository = new SubjectRepository();
