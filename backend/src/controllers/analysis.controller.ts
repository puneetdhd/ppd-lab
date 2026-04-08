import { Request, Response } from 'express';
import { analysisService } from '../services/analysis.service';
import { asyncHandler } from '../utils/asyncHandler';

export const getAnalysisByAssignment = asyncHandler(async (req: Request, res: Response) => {
  const data = await analysisService.getAnalysisByAssignment(req.params.assignmentId);
  res.status(200).json({ success: true, data });
});

export const getMyAnalysis = asyncHandler(async (req: Request, res: Response) => {
  const data = await analysisService.getTeacherAnalysis(req.user!.user_id);
  res.status(200).json({ success: true, count: data.length, data });
});

export const getAllAnalysis = asyncHandler(async (_req: Request, res: Response) => {
  const data = await analysisService.getAllAnalysis();
  res.status(200).json({ success: true, count: data.length, data });
});
