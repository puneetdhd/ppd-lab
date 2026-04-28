import { Request, Response } from 'express';
import { z } from 'zod';
import { markService } from '../services/mark.service';
import { asyncHandler } from '../utils/asyncHandler';

const enterMarkSchema = z.object({
  student_id:    z.string().min(1),
  assignment_id: z.string().min(1),
  midsem:        z.number().min(0).max(20),
  endsem:        z.number().min(0).max(60),
  quiz:          z.number().min(0).max(10),
  assignment:    z.number().min(0).max(10),
});

const updateMarkSchema = z.object({
  midsem:     z.number().min(0).max(20).optional(),
  endsem:     z.number().min(0).max(60).optional(),
  quiz:       z.number().min(0).max(10).optional(),
  assignment: z.number().min(0).max(10).optional(),
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

export const deleteMark = asyncHandler(async (req: Request, res: Response) => {
  const result = await markService.deleteMark(req.params.id);
  res.status(200).json({ success: true, ...result });
});

export const getStudentResults = asyncHandler(async (req: Request, res: Response) => {
  const results = await markService.getStudentResults(req.user!.user_id);
  res.status(200).json({ success: true, count: results.length, data: results });
});

export const getMarksByAssignment = asyncHandler(async (req: Request, res: Response) => {
  const marks = await markService.getMarksByAssignment(req.params.assignmentId);
  res.status(200).json({ success: true, count: marks.length, data: marks });
});

export const bulkImportMarks = asyncHandler(async (req: Request, res: Response) => {
  const { assignment_id, rows } = req.body as {
    assignment_id: string;
    rows: { regdNo: string; name?: string; midsem: number; endsem: number; quiz: number; assignment: number }[];
  };
  if (!assignment_id || !Array.isArray(rows) || rows.length === 0) {
    res.status(400).json({ success: false, message: 'assignment_id and rows[] are required' });
    return;
  }
  const results = await markService.bulkImportMarks(assignment_id, rows);
  const created = results.filter(r => r.status === 'Created').length;
  const updated = results.filter(r => r.status === 'Updated').length;
  const skipped = results.length - created - updated;
  res.status(200).json({ success: true, created, updated, skipped, data: results });
});
