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
