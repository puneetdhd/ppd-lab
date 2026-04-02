import { Request, Response } from 'express';
import { z } from 'zod';
import { teacherService } from '../services/teacher.service';
import { asyncHandler } from '../utils/asyncHandler';

const createTeacherSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
});

export const createTeacher = asyncHandler(async (req: Request, res: Response) => {
  const data = createTeacherSchema.parse(req.body);
  const teacher = await teacherService.createTeacher(data);
  res.status(201).json({ success: true, data: teacher });
});

export const getAllTeachers = asyncHandler(async (_req: Request, res: Response) => {
  const teachers = await teacherService.getAllTeachers();
  res.status(200).json({ success: true, count: teachers.length, data: teachers });
});

export const getTeacherById = asyncHandler(async (req: Request, res: Response) => {
  const teacher = await teacherService.getTeacherById(req.params.id);
  res.status(200).json({ success: true, data: teacher });
});

export const getMyTeacherProfile = asyncHandler(async (req: Request, res: Response) => {
  const teacher = await teacherService.getTeacherByUserId(req.user!.user_id);
  res.status(200).json({ success: true, data: teacher });
});
