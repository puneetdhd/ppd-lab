"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRepository = exports.UserRepository = void 0;
const User_model_1 = require("../models/User.model");
class UserRepository {
    async findByEmail(email) {
        return User_model_1.User.findOne({ email });
    }
    async findById(id) {
        return User_model_1.User.findById(id).select('-password');
    }
    async create(data) {
        const user = new User_model_1.User(data);
        return user.save();
    }
    async findAll() {
        return User_model_1.User.find().select('-password').sort({ createdAt: -1 });
    }
}
exports.UserRepository = UserRepository;
exports.userRepository = new UserRepository();
