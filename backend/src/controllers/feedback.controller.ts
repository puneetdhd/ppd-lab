import { Request, Response } from 'express';
import { z } from 'zod';
import { feedbackService } from '../services/feedback.service';
import { asyncHandler } from '../utils/asyncHandler';

const feedbackSchema = z.object({
  teacher_id: z.string().min(1),
  subject_id: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
});

export const submitFeedback = asyncHandler(async (req: Request, res: Response) => {
  const data = feedbackSchema.parse(req.body);
  const feedback = await feedbackService.submitFeedback({
    userId: req.user!.user_id,
    ...data,
  });
  res.status(201).json({ success: true, data: feedback });
});

export const getAllFeedback = asyncHandler(async (_req: Request, res: Response) => {
  const feedbacks = await feedbackService.getAllFeedback();
  res.status(200).json({ success: true, count: feedbacks.length, data: feedbacks });
});

export const getMyFeedbackAsStudent = asyncHandler(async (req: Request, res: Response) => {
  const feedbacks = await feedbackService.getMyFeedbackAsStudent(req.user!.user_id);
  res.status(200).json({ success: true, count: feedbacks.length, data: feedbacks });
});

export const getFeedbackForTeacher = asyncHandler(async (req: Request, res: Response) => {
  const result = await feedbackService.getFeedbackForTeacher(req.user!.user_id);
  res.status(200).json({ success: true, data: result });
});
