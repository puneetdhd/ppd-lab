"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const AppError_1 = require("../utils/AppError");
const zod_1 = require("zod");
const mongoose_1 = __importDefault(require("mongoose"));
const errorHandler = (err, _req, res, _next) => {
    // Zod validation errors
    if (err instanceof zod_1.ZodError) {
        res.status(400).json({
            success: false,
            message: 'Validation error',
            errors: err.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
        });
        return;
    }
    // Mongoose duplicate key
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue ?? {})[0] ?? 'field';
        res.status(409).json({ success: false, message: `Duplicate value for ${field}` });
        return;
    }
    // Mongoose cast error (invalid ObjectId)
    if (err instanceof mongoose_1.default.Error.CastError) {
        res.status(400).json({ success: false, message: `Invalid ID: ${err.value}` });
        return;
    }
    // Operational AppError
    if (err instanceof AppError_1.AppError) {
        res.status(err.statusCode).json({ success: false, message: err.message });
        return;
    }
    // Unknown errors
    console.error('💥 Unhandled error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
};
exports.errorHandler = errorHandler;
