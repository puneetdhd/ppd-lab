"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.batchRepository = exports.BatchRepository = void 0;
const Batch_model_1 = require("../models/Batch.model");
const mongoose_1 = require("mongoose");
const populateBranch = { path: 'branch_id', select: 'branch_name' };
class BatchRepository {
    async create(data) {
        return Batch_model_1.Batch.create(data);
    }
    async findAll() {
        return Batch_model_1.Batch.find().populate(populateBranch).sort({ start_year: -1 });
    }
    async findById(id) {
        return Batch_model_1.Batch.findById(id).populate(populateBranch);
    }
    async findByBranch(branchId) {
        return Batch_model_1.Batch.find({ branch_id: new mongoose_1.Types.ObjectId(branchId) }).populate(populateBranch);
    }
    async update(id, data) {
        return Batch_model_1.Batch.findByIdAndUpdate(id, data, { new: true, runValidators: true }).populate(populateBranch);
    }
    async delete(id) {
        return Batch_model_1.Batch.findByIdAndDelete(id);
    }
}
exports.BatchRepository = BatchRepository;
exports.batchRepository = new BatchRepository();
