"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const subject_controller_1 = require("../controllers/subject.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const router = (0, express_1.Router)();
// GET is accessible to all authenticated users; mutations are admin-only
router.get('/', auth_middleware_1.verifyToken, subject_controller_1.getAllSubjects);
router.get('/:id', auth_middleware_1.verifyToken, subject_controller_1.getSubjectById);
router.post('/', auth_middleware_1.verifyToken, (0, role_middleware_1.requireRole)('admin'), subject_controller_1.createSubject);
router.put('/:id', auth_middleware_1.verifyToken, (0, role_middleware_1.requireRole)('admin'), subject_controller_1.updateSubject);
router.delete('/:id', auth_middleware_1.verifyToken, (0, role_middleware_1.requireRole)('admin'), subject_controller_1.deleteSubject);
exports.default = router;
