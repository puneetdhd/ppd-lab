"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBranch = exports.updateBranch = exports.getBranchById = exports.getAllBranches = exports.createBranch = void 0;
const zod_1 = require("zod");
const branch_service_1 = require("../services/branch.service");
const asyncHandler_1 = require("../utils/asyncHandler");
const branchSchema = zod_1.z.object({ branch_name: zod_1.z.string().min(1, 'branch_name is required') });
exports.createBranch = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { branch_name } = branchSchema.parse(req.body);
    const branch = await branch_service_1.branchService.createBranch(branch_name);
    res.status(201).json({ success: true, data: branch });
});
exports.getAllBranches = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const branches = await branch_service_1.branchService.getAllBranches();
    res.status(200).json({ success: true, count: branches.length, data: branches });
});
exports.getBranchById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const branch = await branch_service_1.branchService.getBranchById(req.params.id);
    res.status(200).json({ success: true, data: branch });
});
exports.updateBranch = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { branch_name } = branchSchema.parse(req.body);
    const branch = await branch_service_1.branchService.updateBranch(req.params.id, branch_name);
    res.status(200).json({ success: true, data: branch });
});
exports.deleteBranch = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await branch_service_1.branchService.deleteBranch(req.params.id);
    res.status(200).json({ success: true, ...result });
});
