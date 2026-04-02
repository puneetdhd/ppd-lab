"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMarksByAssignment = exports.getStudentResults = exports.updateMark = exports.enterMark = void 0;
const zod_1 = require("zod");
const mark_service_1 = require("../services/mark.service");
const asyncHandler_1 = require("../utils/asyncHandler");
const enterMarkSchema = zod_1.z.object({
    student_id: zod_1.z.string().min(1),
    assignment_id: zod_1.z.string().min(1),
    mid: zod_1.z.number().min(0).max(60),
    quiz: zod_1.z.number().min(0).max(15),
    assignment: zod_1.z.number().min(0).max(15),
    attendance: zod_1.z.number().min(0).max(10),
});
const updateMarkSchema = zod_1.z.object({
    mid: zod_1.z.number().min(0).max(60).optional(),
    quiz: zod_1.z.number().min(0).max(15).optional(),
    assignment: zod_1.z.number().min(0).max(15).optional(),
    attendance: zod_1.z.number().min(0).max(10).optional(),
});
exports.enterMark = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = enterMarkSchema.parse(req.body);
    const mark = await mark_service_1.markService.enterMark(data);
    res.status(201).json({ success: true, data: mark });
});
exports.updateMark = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = updateMarkSchema.parse(req.body);
    const mark = await mark_service_1.markService.updateMark(req.params.id, data);
    res.status(200).json({ success: true, data: mark });
});
exports.getStudentResults = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const results = await mark_service_1.markService.getStudentResults(req.user.user_id);
    res.status(200).json({ success: true, count: results.length, data: results });
});
exports.getMarksByAssignment = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const marks = await mark_service_1.markService.getMarksByAssignment(req.params.assignmentId);
    res.status(200).json({ success: true, count: marks.length, data: marks });
});
