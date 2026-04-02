"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.studentService = exports.StudentService = void 0;
const student_repository_1 = require("../repositories/student.repository");
const user_repository_1 = require("../repositories/user.repository");
const batch_repository_1 = require("../repositories/batch.repository");
const AppError_1 = require("../utils/AppError");
class StudentService {
    async createStudent(data) {
        const existing = await user_repository_1.userRepository.findByEmail(data.email);
        if (existing)
            throw new AppError_1.AppError('Email already in use', 409);
        const batch = await batch_repository_1.batchRepository.findById(data.batch_id);
        if (!batch)
            throw new AppError_1.AppError('Batch not found', 404);
        const user = await user_repository_1.userRepository.create({
            name: data.name,
            email: data.email,
            password: data.password,
            role: 'student',
        });
        const student = await student_repository_1.studentRepository.create({
            user_id: String(user._id),
            batch_id: data.batch_id,
            semester: data.semester,
        });
        return student_repository_1.studentRepository.findById(String(student._id));
    }
    async getAllStudents() {
        return student_repository_1.studentRepository.findAll();
    }
    async getStudentById(id) {
        const student = await student_repository_1.studentRepository.findById(id);
        if (!student)
            throw new AppError_1.AppError('Student not found', 404);
        return student;
    }
    async getStudentByUserId(userId) {
        const student = await student_repository_1.studentRepository.findByUserId(userId);
        if (!student)
            throw new AppError_1.AppError('Student profile not found', 404);
        return student;
    }
    async getStudentsByBatch(batchId) {
        return student_repository_1.studentRepository.findByBatch(batchId);
    }
}
exports.StudentService = StudentService;
exports.studentService = new StudentService();
