"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAssignmentsByBatchSemester = exports.getMyAssignments = exports.getAssignmentById = exports.getAllAssignments = exports.assignTeacher = void 0;
const zod_1 = require("zod");
const assignment_service_1 = require("../services/assignment.service");
const asyncHandler_1 = require("../utils/asyncHandler");
const assignSchema = zod_1.z.object({
    teacher_id: zod_1.z.string().min(1),
    subject_id: zod_1.z.string().min(1),
    batch_id: zod_1.z.string().min(1),
    semester: zod_1.z.number().int().min(1).max(8),
});
exports.assignTeacher = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = assignSchema.parse(req.body);
    const assignment = await assignment_service_1.assignmentService.assignTeacher(data);
    res.status(201).json({ success: true, data: assignment });
});
exports.getAllAssignments = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const assignments = await assignment_service_1.assignmentService.getAllAssignments();
    res.status(200).json({ success: true, count: assignments.length, data: assignments });
});
exports.getAssignmentById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const assignment = await assignment_service_1.assignmentService.getAssignmentById(req.params.id);
    res.status(200).json({ success: true, data: assignment });
});
exports.getMyAssignments = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const assignments = await assignment_service_1.assignmentService.getMyAssignments(req.user.user_id);
    res.status(200).json({ success: true, count: assignments.length, data: assignments });
});
exports.getAssignmentsByBatchSemester = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { batchId, semester } = req.params;
    const assignments = await assignment_service_1.assignmentService.getAssignmentsByBatchSemester(batchId, parseInt(semester, 10));
    res.status(200).json({ success: true, count: assignments.length, data: assignments });
});
