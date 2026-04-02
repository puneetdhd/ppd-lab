"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = void 0;
const AppError_1 = require("../utils/AppError");
const requireRole = (...roles) => (req, _res, next) => {
    if (!req.user)
        return next(new AppError_1.AppError('Not authenticated', 401));
    if (!roles.includes(req.user.role)) {
        return next(new AppError_1.AppError(`Access denied. Required role(s): ${roles.join(', ')}`, 403));
    }
    next();
};
exports.requireRole = requireRole;
