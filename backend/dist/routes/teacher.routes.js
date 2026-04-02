"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const teacher_controller_1 = require("../controllers/teacher.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const router = (0, express_1.Router)();
// Admin: CRUD
router.post('/', auth_middleware_1.verifyToken, (0, role_middleware_1.requireRole)('admin'), teacher_controller_1.createTeacher);
router.get('/', auth_middleware_1.verifyToken, (0, role_middleware_1.requireRole)('admin'), teacher_controller_1.getAllTeachers);
router.get('/me', auth_middleware_1.verifyToken, (0, role_middleware_1.requireRole)('teacher'), teacher_controller_1.getMyTeacherProfile);
router.get('/:id', auth_middleware_1.verifyToken, (0, role_middleware_1.requireRole)('admin'), teacher_controller_1.getTeacherById);
exports.default = router;
