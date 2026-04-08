import { Request, Response } from 'express';
import { z } from 'zod';
import { authService } from '../services/auth.service';
import { asyncHandler } from '../utils/asyncHandler';

const loginSchema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = loginSchema.parse(req.body);
  const result = await authService.login(email, password);
  res.status(200).json({ success: true, data: result });
});

const registerStudentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Valid email required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  batch_id: z.string().min(1, 'Batch is required'),
  semester: z.number().int().min(1).max(8),
});

export const registerStudent = asyncHandler(async (req: Request, res: Response) => {
  const data = registerStudentSchema.parse(req.body);
  const result = await authService.registerStudent(data);
  res.status(201).json({ success: true, data: result });
});

const registerTeacherSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Valid email required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerTeacher = asyncHandler(async (req: Request, res: Response) => {
  const data = registerTeacherSchema.parse(req.body);
  const result = await authService.registerTeacher(data);
  res.status(201).json({ success: true, data: result });
});

const createAdminSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export const createAdmin = asyncHandler(async (req: Request, res: Response) => {
  const data = createAdminSchema.parse(req.body);
  const result = await authService.createAdmin(data);
  res.status(201).json({ success: true, data: result });
});
