"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const feedback_controller_1 = require("../controllers/feedback.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const router = (0, express_1.Router)();
// Student: submit and view own feedback
router.post('/', auth_middleware_1.verifyToken, (0, role_middleware_1.requireRole)('student'), feedback_controller_1.submitFeedback);
router.get('/my', auth_middleware_1.verifyToken, (0, role_middleware_1.requireRole)('student'), feedback_controller_1.getMyFeedbackAsStudent);
// Teacher: view feedback received
router.get('/received', auth_middleware_1.verifyToken, (0, role_middleware_1.requireRole)('teacher'), feedback_controller_1.getFeedbackForTeacher);
// Admin: view all feedback
router.get('/', auth_middleware_1.verifyToken, (0, role_middleware_1.requireRole)('admin'), feedback_controller_1.getAllFeedback);
exports.default = router;
