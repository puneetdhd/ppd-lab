"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const assignment_controller_1 = require("../controllers/assignment.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const router = (0, express_1.Router)();
// Admin
router.post('/', auth_middleware_1.verifyToken, (0, role_middleware_1.requireRole)('admin'), assignment_controller_1.assignTeacher);
router.get('/', auth_middleware_1.verifyToken, (0, role_middleware_1.requireRole)('admin'), assignment_controller_1.getAllAssignments);
router.get('/:id', auth_middleware_1.verifyToken, (0, role_middleware_1.requireRole)('admin', 'teacher'), assignment_controller_1.getAssignmentById);
router.get('/batch/:batchId/semester/:semester', auth_middleware_1.verifyToken, assignment_controller_1.getAssignmentsByBatchSemester);
// Teacher
router.get('/my/assignments', auth_middleware_1.verifyToken, (0, role_middleware_1.requireRole)('teacher'), assignment_controller_1.getMyAssignments);
exports.default = router;
