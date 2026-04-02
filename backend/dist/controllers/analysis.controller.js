"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyAnalysis = exports.getAnalysisByAssignment = void 0;
const analysis_service_1 = require("../services/analysis.service");
const asyncHandler_1 = require("../utils/asyncHandler");
exports.getAnalysisByAssignment = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = await analysis_service_1.analysisService.getAnalysisByAssignment(req.params.assignmentId);
    res.status(200).json({ success: true, data });
});
exports.getMyAnalysis = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = await analysis_service_1.analysisService.getTeacherAnalysis(req.user.user_id);
    res.status(200).json({ success: true, count: data.length, data });
});
