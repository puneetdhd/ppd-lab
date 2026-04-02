"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_repository_1 = require("../repositories/user.repository");
const env_1 = require("../config/env");
const AppError_1 = require("../utils/AppError");
class AuthService {
    async login(email, password) {
        const user = await user_repository_1.userRepository.findByEmail(email);
        if (!user)
            throw new AppError_1.AppError('Invalid email or password', 401);
        const isValid = await user.comparePassword(password);
        if (!isValid)
            throw new AppError_1.AppError('Invalid email or password', 401);
        const token = jsonwebtoken_1.default.sign({ user_id: String(user._id), role: user.role }, env_1.env.JWT_SECRET, { expiresIn: env_1.env.JWT_EXPIRES_IN });
        return {
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role },
        };
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService();
