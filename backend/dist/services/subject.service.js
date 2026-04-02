"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subjectService = exports.SubjectService = void 0;
const subject_repository_1 = require("../repositories/subject.repository");
const AppError_1 = require("../utils/AppError");
class SubjectService {
    async createSubject(data) {
        return subject_repository_1.subjectRepository.create(data);
    }
    async getAllSubjects() {
        return subject_repository_1.subjectRepository.findAll();
    }
    async getSubjectById(id) {
        const subject = await subject_repository_1.subjectRepository.findById(id);
        if (!subject)
            throw new AppError_1.AppError('Subject not found', 404);
        return subject;
    }
    async updateSubject(id, data) {
        const subject = await subject_repository_1.subjectRepository.update(id, data);
        if (!subject)
            throw new AppError_1.AppError('Subject not found', 404);
        return subject;
    }
    async deleteSubject(id) {
        const subject = await subject_repository_1.subjectRepository.delete(id);
        if (!subject)
            throw new AppError_1.AppError('Subject not found', 404);
        return { message: 'Subject deleted successfully' };
    }
}
exports.SubjectService = SubjectService;
exports.subjectService = new SubjectService();
