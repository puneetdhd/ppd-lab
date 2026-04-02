"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const zod_1 = require("zod");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    PORT: zod_1.z.string().default('5000'),
    MONGODB_URI: zod_1.z.string().min(1, 'MONGODB_URI is required'),
    JWT_SECRET: zod_1.z.string().min(1, 'JWT_SECRET is required'),
    JWT_EXPIRES_IN: zod_1.z.string().default('7d'),
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
});
exports.env = envSchema.parse(process.env);
