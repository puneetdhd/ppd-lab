"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.teacherRepository = exports.TeacherRepository = void 0;
const Teacher_model_1 = require("../models/Teacher.model");
class TeacherRepository {
    async create(data) {
        return Teacher_model_1.Teacher.create(data);
    }
    async findAll() {
        return Teacher_model_1.Teacher.find().populate('user_id', 'name email');
    }
    async findById(id) {
        return Teacher_model_1.Teacher.findById(id).populate('user_id', 'name email');
    }
    async findByUserId(userId) {
        return Teacher_model_1.Teacher.findOne({ user_id: userId }).populate('user_id', 'name email');
    }
}
exports.TeacherRepository = TeacherRepository;
exports.teacherRepository = new TeacherRepository();
