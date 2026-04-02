"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const AppError_1 = require("../utils/AppError");
const verifyToken = (req, _res, next) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
        return next(new AppError_1.AppError('No token provided. Please login.', 401));
    }
    const token = header.split(' ')[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
        req.user = { user_id: decoded.user_id, role: decoded.role };
        next();
    }
    catch {
        next(new AppError_1.AppError('Invalid or expired token', 401));
    }
};
exports.verifyToken = verifyToken;
