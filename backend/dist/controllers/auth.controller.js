"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = void 0;
const zod_1 = require("zod");
const auth_service_1 = require("../services/auth.service");
const asyncHandler_1 = require("../utils/asyncHandler");
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Valid email required'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
});
exports.login = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { email, password } = loginSchema.parse(req.body);
    const result = await auth_service_1.authService.login(email, password);
    res.status(200).json({ success: true, data: result });
});
