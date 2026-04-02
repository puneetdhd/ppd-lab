import { Request, Response } from 'express';
import { z } from 'zod';
import { subjectService } from '../services/subject.service';
import { asyncHandler } from '../utils/asyncHandler';

const subjectSchema = z.object({
  subject_name: z.string().min(1, 'subject_name is required'),
  credits: z.number().int().min(1).max(6).optional(),
});

export const createSubject = asyncHandler(async (req: Request, res: Response) => {
  const data = subjectSchema.parse(req.body);
  const subject = await subjectService.createSubject(data);
  res.status(201).json({ success: true, data: subject });
});

export const getAllSubjects = asyncHandler(async (_req: Request, res: Response) => {
  const subjects = await subjectService.getAllSubjects();
  res.status(200).json({ success: true, count: subjects.length, data: subjects });
});

export const getSubjectById = asyncHandler(async (req: Request, res: Response) => {
  const subject = await subjectService.getSubjectById(req.params.id);
  res.status(200).json({ success: true, data: subject });
});

export const updateSubject = asyncHandler(async (req: Request, res: Response) => {
  const data = subjectSchema.partial().parse(req.body);
  const subject = await subjectService.updateSubject(req.params.id, data);
  res.status(200).json({ success: true, data: subject });
});

export const deleteSubject = asyncHandler(async (req: Request, res: Response) => {
  const result = await subjectService.deleteSubject(req.params.id);
  res.status(200).json({ success: true, ...result });
});
