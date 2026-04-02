import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../models/User.model';
import { AppError } from '../utils/AppError';

export const requireRole =
  (...roles: UserRole[]) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) return next(new AppError('Not authenticated', 401));
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(`Access denied. Required role(s): ${roles.join(', ')}`, 403)
      );
    }
    next();
  };
