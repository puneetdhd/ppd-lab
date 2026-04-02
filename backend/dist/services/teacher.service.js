"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.teacherService = exports.TeacherService = void 0;
const teacher_repository_1 = require("../repositories/teacher.repository");
const user_repository_1 = require("../repositories/user.repository");
const AppError_1 = require("../utils/AppError");
class TeacherService {
    async createTeacher(data) {
        const existing = await user_repository_1.userRepository.findByEmail(data.email);
        if (existing)
            throw new AppError_1.AppError('Email already in use', 409);
        const user = await user_repository_1.userRepository.create({ ...data, role: 'teacher' });
        const teacher = await teacher_repository_1.teacherRepository.create({ user_id: String(user._id) });
        // Return populated teacher
        return teacher_repository_1.teacherRepository.findById(String(teacher._id));
    }
    async getAllTeachers() {
        return teacher_repository_1.teacherRepository.findAll();
    }
    async getTeacherById(id) {
        const teacher = await teacher_repository_1.teacherRepository.findById(id);
        if (!teacher)
            throw new AppError_1.AppError('Teacher not found', 404);
        return teacher;
    }
    async getTeacherByUserId(userId) {
        const teacher = await teacher_repository_1.teacherRepository.findByUserId(userId);
        if (!teacher)
            throw new AppError_1.AppError('Teacher profile not found', 404);
        return teacher;
    }
}
exports.TeacherService = TeacherService;
exports.teacherService = new TeacherService();
