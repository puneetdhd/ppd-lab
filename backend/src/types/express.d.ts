import { UserRole } from '../models/User.model';

declare global {
  namespace Express {
    interface Request {
      user?: {
        user_id: string;
        role: UserRole;
      };
    }
  }
}

export {};
