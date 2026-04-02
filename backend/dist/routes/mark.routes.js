"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mark_controller_1 = require("../controllers/mark.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const router = (0, express_1.Router)();
// Teacher: enter and update marks
router.post('/', auth_middleware_1.verifyToken, (0, role_middleware_1.requireRole)('teacher'), mark_controller_1.enterMark);
router.put('/:id', auth_middleware_1.verifyToken, (0, role_middleware_1.requireRole)('teacher'), mark_controller_1.updateMark);
// Teacher/Admin: view marks for an assignment
router.get('/assignment/:assignmentId', auth_middleware_1.verifyToken, (0, role_middleware_1.requireRole)('teacher', 'admin'), mark_controller_1.getMarksByAssignment);
// Student: view own results
router.get('/results', auth_middleware_1.verifyToken, (0, role_middleware_1.requireRole)('student'), mark_controller_1.getStudentResults);
exports.default = router;
