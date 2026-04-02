import { Request, Response } from 'express';
import { z } from 'zod';
import { branchService } from '../services/branch.service';
import { asyncHandler } from '../utils/asyncHandler';

const branchSchema = z.object({ branch_name: z.string().min(1, 'branch_name is required') });

export const createBranch = asyncHandler(async (req: Request, res: Response) => {
  const { branch_name } = branchSchema.parse(req.body);
  const branch = await branchService.createBranch(branch_name);
  res.status(201).json({ success: true, data: branch });
});

export const getAllBranches = asyncHandler(async (_req: Request, res: Response) => {
  const branches = await branchService.getAllBranches();
  res.status(200).json({ success: true, count: branches.length, data: branches });
});

export const getBranchById = asyncHandler(async (req: Request, res: Response) => {
  const branch = await branchService.getBranchById(req.params.id);
  res.status(200).json({ success: true, data: branch });
});

export const updateBranch = asyncHandler(async (req: Request, res: Response) => {
  const { branch_name } = branchSchema.parse(req.body);
  const branch = await branchService.updateBranch(req.params.id, branch_name);
  res.status(200).json({ success: true, data: branch });
});

export const deleteBranch = asyncHandler(async (req: Request, res: Response) => {
  const result = await branchService.deleteBranch(req.params.id);
  res.status(200).json({ success: true, ...result });
});
