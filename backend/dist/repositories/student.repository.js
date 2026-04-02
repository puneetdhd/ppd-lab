"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.studentRepository = exports.StudentRepository = void 0;
const Student_model_1 = require("../models/Student.model");
const populateStudent = [
    { path: 'user_id', select: 'name email' },
    { path: 'batch_id', populate: { path: 'branch_id', select: 'branch_name' } },
];
class StudentRepository {
    async create(data) {
        return Student_model_1.Student.create(data);
    }
    async findAll() {
        return Student_model_1.Student.find().populate(populateStudent).sort({ createdAt: -1 });
    }
    async findById(id) {
        return Student_model_1.Student.findById(id).populate(populateStudent);
    }
    async findByUserId(userId) {
        return Student_model_1.Student.findOne({ user_id: userId }).populate(populateStudent);
    }
    async findByBatch(batchId) {
        return Student_model_1.Student.find({ batch_id: batchId }).populate({
            path: 'user_id',
            select: 'name email',
        });
    }
    async findByBatchAndSemester(batchId, semester) {
        return Student_model_1.Student.find({ batch_id: batchId, semester }).populate({
            path: 'user_id',
            select: 'name email',
        });
    }
}
exports.StudentRepository = StudentRepository;
exports.studentRepository = new StudentRepository();
