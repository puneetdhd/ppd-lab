import { Request, Response } from 'express';
import { reportService } from '../services/report.service';
import { asyncHandler } from '../utils/asyncHandler';

export const subjectReport = asyncHandler(async (req: Request, res: Response) => {
  const { assignmentId } = req.params;
  const format = req.query.format as string;

  if (format === 'csv') {
    const csv = await reportService.subjectReportCSV(assignmentId);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="subject-report-${assignmentId}.csv"`
    );
    res.status(200).send(csv);
    return;
  }

  const data = await reportService.subjectReport(assignmentId);
  res.status(200).json({ success: true, count: data.length, data });
});

export const batchReport = asyncHandler(async (req: Request, res: Response) => {
  const data = await reportService.batchReport(req.params.batchId);
  res.status(200).json({ success: true, count: data.length, data });
});

export const gradeDistribution = asyncHandler(async (req: Request, res: Response) => {
  const data = await reportService.gradeDistribution(req.params.assignmentId);
  res.status(200).json({ success: true, data });
});
