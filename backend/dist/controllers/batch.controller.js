"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBatch = exports.updateBatch = exports.getBatchById = exports.getBatchesByBranch = exports.getAllBatches = exports.createBatch = void 0;
const zod_1 = require("zod");
const batch_service_1 = require("../services/batch.service");
const asyncHandler_1 = require("../utils/asyncHandler");
const batchSchema = zod_1.z.object({
    branch_id: zod_1.z.string().min(1),
    start_year: zod_1.z.number().int().min(2000).max(2100),
    graduation_year: zod_1.z.number().int().min(2000).max(2100),
});
exports.createBatch = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = batchSchema.parse(req.body);
    const batch = await batch_service_1.batchService.createBatch(data);
    res.status(201).json({ success: true, data: batch });
});
exports.getAllBatches = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const batches = await batch_service_1.batchService.getAllBatches();
    res.status(200).json({ success: true, count: batches.length, data: batches });
});
exports.getBatchesByBranch = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const batches = await batch_service_1.batchService.getBatchesByBranch(req.params.branchId);
    res.status(200).json({ success: true, count: batches.length, data: batches });
});
exports.getBatchById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const batch = await batch_service_1.batchService.getBatchById(req.params.id);
    res.status(200).json({ success: true, data: batch });
});
exports.updateBatch = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = batchSchema.partial().parse(req.body);
    const batch = await batch_service_1.batchService.updateBatch(req.params.id, data);
    res.status(200).json({ success: true, data: batch });
});
exports.deleteBatch = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await batch_service_1.batchService.deleteBatch(req.params.id);
    res.status(200).json({ success: true, ...result });
});
