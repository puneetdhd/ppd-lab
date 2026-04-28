import { Request, Response } from 'express';
import { z } from 'zod';
import { assignmentService } from '../services/assignment.service';
import { asyncHandler } from '../utils/asyncHandler';

const assignSchema = z.object({
  teacher_id: z.string().min(1),
  subject_id: z.string().min(1),
  batch_id: z.string().min(1),
  semester: z.number().int().min(1).max(8),
});

export const assignTeacher = asyncHandler(async (req: Request, res: Response) => {
  const data = assignSchema.parse(req.body);
  const assignment = await assignmentService.assignTeacher(data);
  res.status(201).json({ success: true, data: assignment });
});

export const getAllAssignments = asyncHandler(async (_req: Request, res: Response) => {
  const assignments = await assignmentService.getAllAssignments();
  res.status(200).json({ success: true, count: assignments.length, data: assignments });
});

export const getAssignmentById = asyncHandler(async (req: Request, res: Response) => {
  const assignment = await assignmentService.getAssignmentById(req.params.id);
  res.status(200).json({ success: true, data: assignment });
});

export const getMyAssignments = asyncHandler(async (req: Request, res: Response) => {
  const assignments = await assignmentService.getMyAssignments(req.user!.user_id);
  res.status(200).json({ success: true, count: assignments.length, data: assignments });
});

export const getAssignmentsByBatchSemester = asyncHandler(
  async (req: Request, res: Response) => {
    const { batchId, semester } = req.params;
    const assignments = await assignmentService.getAssignmentsByBatchSemester(
      batchId,
      parseInt(semester, 10)
    );
    res.status(200).json({ success: true, count: assignments.length, data: assignments });
  }
);

export const getStudentAssignments = asyncHandler(async (req: Request, res: Response) => {
  const assignments = await assignmentService.getStudentAssignments(req.user!.user_id);
  res.status(200).json({ success: true, count: assignments.length, data: assignments });
});

export const deleteAssignment = asyncHandler(async (req: Request, res: Response) => {
  const result = await assignmentService.deleteAssignment(req.params.id);
  res.status(200).json({ success: true, ...result });
});
