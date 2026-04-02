import { Request, Response } from 'express';
import { z } from 'zod';
import { markService } from '../services/mark.service';
import { asyncHandler } from '../utils/asyncHandler';

const enterMarkSchema = z.object({
  student_id: z.string().min(1),
  assignment_id: z.string().min(1),
  mid: z.number().min(0).max(60),
  quiz: z.number().min(0).max(15),
  assignment: z.number().min(0).max(15),
  attendance: z.number().min(0).max(10),
});

const updateMarkSchema = z.object({
  mid: z.number().min(0).max(60).optional(),
  quiz: z.number().min(0).max(15).optional(),
  assignment: z.number().min(0).max(15).optional(),
  attendance: z.number().min(0).max(10).optional(),
});

export const enterMark = asyncHandler(async (req: Request, res: Response) => {
  const data = enterMarkSchema.parse(req.body);
  const mark = await markService.enterMark(data);
  res.status(201).json({ success: true, data: mark });
});

export const updateMark = asyncHandler(async (req: Request, res: Response) => {
  const data = updateMarkSchema.parse(req.body);
  const mark = await markService.updateMark(req.params.id, data);
  res.status(200).json({ success: true, data: mark });
});

export const getStudentResults = asyncHandler(async (req: Request, res: Response) => {
  const results = await markService.getStudentResults(req.user!.user_id);
  res.status(200).json({ success: true, count: results.length, data: results });
});

export const getMarksByAssignment = asyncHandler(async (req: Request, res: Response) => {
  const marks = await markService.getMarksByAssignment(req.params.assignmentId);
  res.status(200).json({ success: true, count: marks.length, data: marks });
});
