"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.batchService = exports.BatchService = void 0;
const batch_repository_1 = require("../repositories/batch.repository");
const branch_repository_1 = require("../repositories/branch.repository");
const AppError_1 = require("../utils/AppError");
class BatchService {
    async createBatch(data) {
        const branch = await branch_repository_1.branchRepository.findById(data.branch_id);
        if (!branch)
            throw new AppError_1.AppError('Branch not found', 404);
        if (data.graduation_year <= data.start_year) {
            throw new AppError_1.AppError('graduation_year must be greater than start_year', 400);
        }
        return batch_repository_1.batchRepository.create(data);
    }
    async getAllBatches() {
        return batch_repository_1.batchRepository.findAll();
    }
    async getBatchById(id) {
        const batch = await batch_repository_1.batchRepository.findById(id);
        if (!batch)
            throw new AppError_1.AppError('Batch not found', 404);
        return batch;
    }
    async getBatchesByBranch(branchId) {
        return batch_repository_1.batchRepository.findByBranch(branchId);
    }
    async updateBatch(id, data) {
        const batch = await batch_repository_1.batchRepository.update(id, data);
        if (!batch)
            throw new AppError_1.AppError('Batch not found', 404);
        return batch;
    }
    async deleteBatch(id) {
        const batch = await batch_repository_1.batchRepository.delete(id);
        if (!batch)
            throw new AppError_1.AppError('Batch not found', 404);
        return { message: 'Batch deleted successfully' };
    }
}
exports.BatchService = BatchService;
exports.batchService = new BatchService();
