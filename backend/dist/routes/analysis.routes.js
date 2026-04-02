"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const analysis_controller_1 = require("../controllers/analysis.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const router = (0, express_1.Router)();
// Teacher: view their own analysis across all assignments
router.get('/my', auth_middleware_1.verifyToken, (0, role_middleware_1.requireRole)('teacher'), analysis_controller_1.getMyAnalysis);
// Teacher/Admin: analysis for a specific assignment
router.get('/:assignmentId', auth_middleware_1.verifyToken, (0, role_middleware_1.requireRole)('teacher', 'admin'), analysis_controller_1.getAnalysisByAssignment);
exports.default = router;
