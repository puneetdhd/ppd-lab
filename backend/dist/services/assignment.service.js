"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignmentService = exports.AssignmentService = void 0;
const assignment_repository_1 = require("../repositories/assignment.repository");
const teacher_repository_1 = require("../repositories/teacher.repository");
const subject_repository_1 = require("../repositories/subject.repository");
const batch_repository_1 = require("../repositories/batch.repository");
const AppError_1 = require("../utils/AppError");
class AssignmentService {
    async assignTeacher(data) {
        const [teacher, subject, batch] = await Promise.all([
            teacher_repository_1.teacherRepository.findById(data.teacher_id),
            subject_repository_1.subjectRepository.findById(data.subject_id),
            batch_repository_1.batchRepository.findById(data.batch_id),
        ]);
        if (!teacher)
            throw new AppError_1.AppError('Teacher not found', 404);
        if (!subject)
            throw new AppError_1.AppError('Subject not found', 404);
        if (!batch)
            throw new AppError_1.AppError('Batch not found', 404);
        return assignment_repository_1.assignmentRepository.create(data);
    }
    async getAllAssignments() {
        return assignment_repository_1.assignmentRepository.findAll();
    }
    async getAssignmentById(id) {
        const assignment = await assignment_repository_1.assignmentRepository.findById(id);
        if (!assignment)
            throw new AppError_1.AppError('Teaching assignment not found', 404);
        return assignment;
    }
    async getMyAssignments(userId) {
        const { teacherRepository: tr } = await Promise.resolve().then(() => __importStar(require('../repositories/teacher.repository')));
        const teacher = await tr.findByUserId(userId);
        if (!teacher)
            throw new AppError_1.AppError('Teacher profile not found', 404);
        return assignment_repository_1.assignmentRepository.findByTeacher(String(teacher._id));
    }
    async getAssignmentsByBatchSemester(batchId, semester) {
        return assignment_repository_1.assignmentRepository.findByBatchAndSemester(batchId, semester);
    }
}
exports.AssignmentService = AssignmentService;
exports.assignmentService = new AssignmentService();
