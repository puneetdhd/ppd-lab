"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFeedbackForTeacher = exports.getMyFeedbackAsStudent = exports.getAllFeedback = exports.submitFeedback = void 0;
const zod_1 = require("zod");
const feedback_service_1 = require("../services/feedback.service");
const asyncHandler_1 = require("../utils/asyncHandler");
const feedbackSchema = zod_1.z.object({
    teacher_id: zod_1.z.string().min(1),
    subject_id: zod_1.z.string().min(1),
    rating: zod_1.z.number().int().min(1).max(5),
    comment: zod_1.z.string().max(500).optional(),
});
exports.submitFeedback = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = feedbackSchema.parse(req.body);
    const feedback = await feedback_service_1.feedbackService.submitFeedback({
        userId: req.user.user_id,
        ...data,
    });
    res.status(201).json({ success: true, data: feedback });
});
exports.getAllFeedback = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const feedbacks = await feedback_service_1.feedbackService.getAllFeedback();
    res.status(200).json({ success: true, count: feedbacks.length, data: feedbacks });
});
exports.getMyFeedbackAsStudent = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const feedbacks = await feedback_service_1.feedbackService.getMyFeedbackAsStudent(req.user.user_id);
    res.status(200).json({ success: true, count: feedbacks.length, data: feedbacks });
});
exports.getFeedbackForTeacher = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await feedback_service_1.feedbackService.getFeedbackForTeacher(req.user.user_id);
    res.status(200).json({ success: true, data: result });
});
