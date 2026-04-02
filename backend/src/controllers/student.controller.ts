import { Request, Response } from 'express';
import { z } from 'zod';
import { studentService } from '../services/student.service';
import { asyncHandler } from '../utils/asyncHandler';

const createStudentSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  batch_id: z.string().min(1),
  semester: z.number().int().min(1).max(8),
});

export const createStudent = asyncHandler(async (req: Request, res: Response) => {
  const data = createStudentSchema.parse(req.body);
  const student = await studentService.createStudent(data);
  res.status(201).json({ success: true, data: student });
});

export const getAllStudents = asyncHandler(async (_req: Request, res: Response) => {
  const students = await studentService.getAllStudents();
  res.status(200).json({ success: true, count: students.length, data: students });
});

export const getStudentById = asyncHandler(async (req: Request, res: Response) => {
  const student = await studentService.getStudentById(req.params.id);
  res.status(200).json({ success: true, data: student });
});

export const getStudentsByBatch = asyncHandler(async (req: Request, res: Response) => {
  const students = await studentService.getStudentsByBatch(req.params.batchId);
  res.status(200).json({ success: true, count: students.length, data: students });
});

export const getMyStudentProfile = asyncHandler(async (req: Request, res: Response) => {
  const student = await studentService.getStudentByUserId(req.user!.user_id);
  res.status(200).json({ success: true, data: student });
});
