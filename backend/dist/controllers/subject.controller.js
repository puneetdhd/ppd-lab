"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSubject = exports.updateSubject = exports.getSubjectById = exports.getAllSubjects = exports.createSubject = void 0;
const zod_1 = require("zod");
const subject_service_1 = require("../services/subject.service");
const asyncHandler_1 = require("../utils/asyncHandler");
const subjectSchema = zod_1.z.object({
    subject_name: zod_1.z.string().min(1, 'subject_name is required'),
    credits: zod_1.z.number().int().min(1).max(6).optional(),
});
exports.createSubject = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = subjectSchema.parse(req.body);
    const subject = await subject_service_1.subjectService.createSubject(data);
    res.status(201).json({ success: true, data: subject });
});
exports.getAllSubjects = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const subjects = await subject_service_1.subjectService.getAllSubjects();
    res.status(200).json({ success: true, count: subjects.length, data: subjects });
});
exports.getSubjectById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const subject = await subject_service_1.subjectService.getSubjectById(req.params.id);
    res.status(200).json({ success: true, data: subject });
});
exports.updateSubject = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = subjectSchema.partial().parse(req.body);
    const subject = await subject_service_1.subjectService.updateSubject(req.params.id, data);
    res.status(200).json({ success: true, data: subject });
});
exports.deleteSubject = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await subject_service_1.subjectService.deleteSubject(req.params.id);
    res.status(200).json({ success: true, ...result });
});
