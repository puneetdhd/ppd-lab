import { Request, Response } from 'express';
import { z } from 'zod';
import { teacherService } from '../services/teacher.service';
import { asyncHandler } from '../utils/asyncHandler';

const createTeacherSchema = z.object({
  name: z.string().min(1),
  regdNo: z.string().min(1),
});

export const createTeacher = asyncHandler(async (req: Request, res: Response) => {
  const data = createTeacherSchema.parse(req.body);
  const teacher = await teacherService.createTeacher(data);
  res.status(201).json({ success: true, data: teacher });
});

export const bulkCreateTeachers = asyncHandler(async (req: Request, res: Response) => {
  const { rows } = req.body as { rows: { name: string; regdNo: string }[] };
  if (!Array.isArray(rows) || rows.length === 0) {
    res.status(400).json({ success: false, message: 'rows array is required' });
    return;
  }
  const results = await teacherService.bulkCreateTeachers(rows);
  res.status(200).json({ success: true, data: results });
});

export const getAllTeachers = asyncHandler(async (req: Request, res: Response) => {
  const page   = Math.max(1, parseInt(req.query.page  as string) || 1);
  const limit  = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
  const search = (req.query.search as string)?.trim() || undefined;

  const { data, total } = await teacherService.getTeachersPaginated(page, limit, search);

  res.status(200).json({
    success: true,
    data,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
});

export const getTeacherById = asyncHandler(async (req: Request, res: Response) => {
  const teacher = await teacherService.getTeacherById(req.params.id);
  res.status(200).json({ success: true, data: teacher });
});

export const getMyTeacherProfile = asyncHandler(async (req: Request, res: Response) => {
  const teacher = await teacherService.getTeacherByUserId(req.user!.user_id);
  res.status(200).json({ success: true, data: teacher });
});

export const deleteTeacher = asyncHandler(async (req: Request, res: Response) => {
  const result = await teacherService.deleteTeacher(req.params.id);
  res.status(200).json({ success: true, ...result });
});
