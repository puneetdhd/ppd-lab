"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.branchRepository = exports.BranchRepository = void 0;
const Branch_model_1 = require("../models/Branch.model");
class BranchRepository {
    async create(data) {
        return Branch_model_1.Branch.create(data);
    }
    async findAll() {
        return Branch_model_1.Branch.find().sort({ branch_name: 1 });
    }
    async findById(id) {
        return Branch_model_1.Branch.findById(id);
    }
    async update(id, data) {
        return Branch_model_1.Branch.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    }
    async delete(id) {
        return Branch_model_1.Branch.findByIdAndDelete(id);
    }
}
exports.BranchRepository = BranchRepository;
exports.branchRepository = new BranchRepository();
