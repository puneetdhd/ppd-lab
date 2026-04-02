"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const report_controller_1 = require("../controllers/report.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const router = (0, express_1.Router)();
// Admin/Teacher can access reports
router.get('/subject/:assignmentId', auth_middleware_1.verifyToken, (0, role_middleware_1.requireRole)('admin', 'teacher'), report_controller_1.subjectReport);
router.get('/batch/:batchId', auth_middleware_1.verifyToken, (0, role_middleware_1.requireRole)('admin', 'teacher'), report_controller_1.batchReport);
router.get('/grades/:assignmentId', auth_middleware_1.verifyToken, (0, role_middleware_1.requireRole)('admin', 'teacher'), report_controller_1.gradeDistribution);
exports.default = router;
