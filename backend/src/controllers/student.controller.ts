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

export const getAllStudents = asyncHandler(async (req: Request, res: Response) => {
  const page   = Math.max(1, parseInt(req.query.page  as string) || 1);
  const limit  = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
  const search = (req.query.search as string)?.trim() || undefined;

  const { data, total } = await studentService.getStudentsPaginated(page, limit, search);

  res.status(200).json({
    success: true,
    data,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
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

export const deleteStudent = asyncHandler(async (req: Request, res: Response) => {
  const result = await studentService.deleteStudent(req.params.id);
  res.status(200).json({ success: true, ...result });
});

const bulkCreateSchema = z.object({
  batch_id: z.string().min(1),
  rows: z.array(z.object({
    name: z.string(),
    regdNo: z.string(),
  })).min(1, 'At least one row is required'),
});

export const bulkCreateStudents = asyncHandler(async (req: Request, res: Response) => {
  const { batch_id, rows } = bulkCreateSchema.parse(req.body);
  const results = await studentService.bulkCreateStudents(rows, batch_id);
  const created = results.filter(r => r.status === 'Created').length;
  res.status(201).json({
    success: true,
    total: rows.length,
    created,
    skipped: rows.length - created,
    data: results,
  });
});
