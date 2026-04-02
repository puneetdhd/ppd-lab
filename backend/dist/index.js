"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const db_1 = require("./config/db");
const env_1 = require("./config/env");
const error_middleware_1 = require("./middleware/error.middleware");
// Routes
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const branch_routes_1 = __importDefault(require("./routes/branch.routes"));
const batch_routes_1 = __importDefault(require("./routes/batch.routes"));
const subject_routes_1 = __importDefault(require("./routes/subject.routes"));
const teacher_routes_1 = __importDefault(require("./routes/teacher.routes"));
const student_routes_1 = __importDefault(require("./routes/student.routes"));
const assignment_routes_1 = __importDefault(require("./routes/assignment.routes"));
const mark_routes_1 = __importDefault(require("./routes/mark.routes"));
const analysis_routes_1 = __importDefault(require("./routes/analysis.routes"));
const feedback_routes_1 = __importDefault(require("./routes/feedback.routes"));
const report_routes_1 = __importDefault(require("./routes/report.routes"));
const app = (0, express_1.default)();
// ─── Global Middleware ───────────────────────────────────────────────────────
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// ─── Health Check ────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
    res.status(200).json({ success: true, message: 'Server is running', env: env_1.env.NODE_ENV });
});
// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth', auth_routes_1.default);
app.use('/api/branches', branch_routes_1.default);
app.use('/api/batches', batch_routes_1.default);
app.use('/api/subjects', subject_routes_1.default);
app.use('/api/teachers', teacher_routes_1.default);
app.use('/api/students', student_routes_1.default);
app.use('/api/assignments', assignment_routes_1.default);
app.use('/api/marks', mark_routes_1.default);
app.use('/api/analysis', analysis_routes_1.default);
app.use('/api/feedback', feedback_routes_1.default);
app.use('/api/reports', report_routes_1.default);
// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});
// ─── Global Error Handler ────────────────────────────────────────────────────
app.use(error_middleware_1.errorHandler);
// ─── Start Server ─────────────────────────────────────────────────────────────
const startServer = async () => {
    await (0, db_1.connectDB)();
    app.listen(Number(env_1.env.PORT), () => {
        console.log(`🚀 Server running on http://localhost:${env_1.env.PORT}`);
        console.log(`📋 Environment: ${env_1.env.NODE_ENV}`);
    });
};
startServer();
exports.default = app;
