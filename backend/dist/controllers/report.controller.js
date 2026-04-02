"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gradeDistribution = exports.batchReport = exports.subjectReport = void 0;
const report_service_1 = require("../services/report.service");
const asyncHandler_1 = require("../utils/asyncHandler");
exports.subjectReport = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { assignmentId } = req.params;
    const format = req.query.format;
    if (format === 'csv') {
        const csv = await report_service_1.reportService.subjectReportCSV(assignmentId);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="subject-report-${assignmentId}.csv"`);
        res.status(200).send(csv);
        return;
    }
    const data = await report_service_1.reportService.subjectReport(assignmentId);
    res.status(200).json({ success: true, count: data.length, data });
});
exports.batchReport = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = await report_service_1.reportService.batchReport(req.params.batchId);
    res.status(200).json({ success: true, count: data.length, data });
});
exports.gradeDistribution = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = await report_service_1.reportService.gradeDistribution(req.params.assignmentId);
    res.status(200).json({ success: true, data });
});
