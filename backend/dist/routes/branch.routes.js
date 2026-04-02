"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const branch_controller_1 = require("../controllers/branch.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const router = (0, express_1.Router)();
// All branch routes — Admin only
router.use(auth_middleware_1.verifyToken, (0, role_middleware_1.requireRole)('admin'));
router.post('/', branch_controller_1.createBranch);
router.get('/', branch_controller_1.getAllBranches);
router.get('/:id', branch_controller_1.getBranchById);
router.put('/:id', branch_controller_1.updateBranch);
router.delete('/:id', branch_controller_1.deleteBranch);
exports.default = router;
