"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyTeacherProfile = exports.getTeacherById = exports.getAllTeachers = exports.createTeacher = void 0;
const zod_1 = require("zod");
const teacher_service_1 = require("../services/teacher.service");
const asyncHandler_1 = require("../utils/asyncHandler");
const createTeacherSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
});
exports.createTeacher = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = createTeacherSchema.parse(req.body);
    const teacher = await teacher_service_1.teacherService.createTeacher(data);
    res.status(201).json({ success: true, data: teacher });
});
exports.getAllTeachers = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const teachers = await teacher_service_1.teacherService.getAllTeachers();
    res.status(200).json({ success: true, count: teachers.length, data: teachers });
});
exports.getTeacherById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const teacher = await teacher_service_1.teacherService.getTeacherById(req.params.id);
    res.status(200).json({ success: true, data: teacher });
});
exports.getMyTeacherProfile = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const teacher = await teacher_service_1.teacherService.getTeacherByUserId(req.user.user_id);
    res.status(200).json({ success: true, data: teacher });
});
