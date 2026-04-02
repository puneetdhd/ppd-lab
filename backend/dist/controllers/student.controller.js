"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyStudentProfile = exports.getStudentsByBatch = exports.getStudentById = exports.getAllStudents = exports.createStudent = void 0;
const zod_1 = require("zod");
const student_service_1 = require("../services/student.service");
const asyncHandler_1 = require("../utils/asyncHandler");
const createStudentSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
    batch_id: zod_1.z.string().min(1),
    semester: zod_1.z.number().int().min(1).max(8),
});
exports.createStudent = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = createStudentSchema.parse(req.body);
    const student = await student_service_1.studentService.createStudent(data);
    res.status(201).json({ success: true, data: student });
});
exports.getAllStudents = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const students = await student_service_1.studentService.getAllStudents();
    res.status(200).json({ success: true, count: students.length, data: students });
});
exports.getStudentById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const student = await student_service_1.studentService.getStudentById(req.params.id);
    res.status(200).json({ success: true, data: student });
});
exports.getStudentsByBatch = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const students = await student_service_1.studentService.getStudentsByBatch(req.params.batchId);
    res.status(200).json({ success: true, count: students.length, data: students });
});
exports.getMyStudentProfile = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const student = await student_service_1.studentService.getStudentByUserId(req.user.user_id);
    res.status(200).json({ success: true, data: student });
});
