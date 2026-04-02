import { Request, Response } from 'express';
import { z } from 'zod';
import { batchService } from '../services/batch.service';
import { asyncHandler } from '../utils/asyncHandler';

const batchSchema = z.object({
  branch_id: z.string().min(1),
  start_year: z.number().int().min(2000).max(2100),
  graduation_year: z.number().int().min(2000).max(2100),
});

export const createBatch = asyncHandler(async (req: Request, res: Response) => {
  const data = batchSchema.parse(req.body);
  const batch = await batchService.createBatch(data);
  res.status(201).json({ success: true, data: batch });
});

export const getAllBatches = asyncHandler(async (_req: Request, res: Response) => {
  const batches = await batchService.getAllBatches();
  res.status(200).json({ success: true, count: batches.length, data: batches });
});

export const getBatchesByBranch = asyncHandler(async (req: Request, res: Response) => {
  const batches = await batchService.getBatchesByBranch(req.params.branchId);
  res.status(200).json({ success: true, count: batches.length, data: batches });
});

export const getBatchById = asyncHandler(async (req: Request, res: Response) => {
  const batch = await batchService.getBatchById(req.params.id);
  res.status(200).json({ success: true, data: batch });
});

export const updateBatch = asyncHandler(async (req: Request, res: Response) => {
  const data = batchSchema.partial().parse(req.body);
  const batch = await batchService.updateBatch(req.params.id, data);
  res.status(200).json({ success: true, data: batch });
});

export const deleteBatch = asyncHandler(async (req: Request, res: Response) => {
  const result = await batchService.deleteBatch(req.params.id);
  res.status(200).json({ success: true, ...result });
});
