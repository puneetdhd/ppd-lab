"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.branchService = exports.BranchService = void 0;
const branch_repository_1 = require("../repositories/branch.repository");
const AppError_1 = require("../utils/AppError");
class BranchService {
    async createBranch(branch_name) {
        return branch_repository_1.branchRepository.create({ branch_name });
    }
    async getAllBranches() {
        return branch_repository_1.branchRepository.findAll();
    }
    async getBranchById(id) {
        const branch = await branch_repository_1.branchRepository.findById(id);
        if (!branch)
            throw new AppError_1.AppError('Branch not found', 404);
        return branch;
    }
    async updateBranch(id, branch_name) {
        const branch = await branch_repository_1.branchRepository.update(id, { branch_name });
        if (!branch)
            throw new AppError_1.AppError('Branch not found', 404);
        return branch;
    }
    async deleteBranch(id) {
        const branch = await branch_repository_1.branchRepository.delete(id);
        if (!branch)
            throw new AppError_1.AppError('Branch not found', 404);
        return { message: 'Branch deleted successfully' };
    }
}
exports.BranchService = BranchService;
exports.branchService = new BranchService();
