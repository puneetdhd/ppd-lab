"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignmentRepository = exports.AssignmentRepository = void 0;
const TeachingAssignment_model_1 = require("../models/TeachingAssignment.model");
const populateAssignment = [
    { path: 'teacher_id', populate: { path: 'user_id', select: 'name email' } },
    { path: 'subject_id', select: 'subject_name credits' },
    { path: 'batch_id', populate: { path: 'branch_id', select: 'branch_name' } },
];
class AssignmentRepository {
    async create(data) {
        return TeachingAssignment_model_1.TeachingAssignment.create(data);
    }
    async findAll() {
        return TeachingAssignment_model_1.TeachingAssignment.find().populate(populateAssignment).sort({ createdAt: -1 });
    }
    async findById(id) {
        return TeachingAssignment_model_1.TeachingAssignment.findById(id).populate(populateAssignment);
    }
    async findByTeacher(teacherId) {
        return TeachingAssignment_model_1.TeachingAssignment.find({ teacher_id: teacherId })
            .populate({ path: 'subject_id', select: 'subject_name credits' })
            .populate({ path: 'batch_id', populate: { path: 'branch_id', select: 'branch_name' } });
    }
    async findByBatchAndSemester(batchId, semester) {
        return TeachingAssignment_model_1.TeachingAssignment.find({ batch_id: batchId, semester })
            .populate({ path: 'teacher_id', populate: { path: 'user_id', select: 'name' } })
            .populate('subject_id', 'subject_name');
    }
}
exports.AssignmentRepository = AssignmentRepository;
exports.assignmentRepository = new AssignmentRepository();
