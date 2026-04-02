"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subjectRepository = exports.SubjectRepository = void 0;
const Subject_model_1 = require("../models/Subject.model");
class SubjectRepository {
    async create(data) {
        return Subject_model_1.Subject.create(data);
    }
    async findAll() {
        return Subject_model_1.Subject.find().sort({ subject_name: 1 });
    }
    async findById(id) {
        return Subject_model_1.Subject.findById(id);
    }
    async update(id, data) {
        return Subject_model_1.Subject.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    }
    async delete(id) {
        return Subject_model_1.Subject.findByIdAndDelete(id);
    }
}
exports.SubjectRepository = SubjectRepository;
exports.subjectRepository = new SubjectRepository();
