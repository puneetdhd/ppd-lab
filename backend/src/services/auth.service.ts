import jwt from 'jsonwebtoken';
import { userRepository } from '../repositories/user.repository';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';

export class AuthService {
  async login(email: string, password: string) {
    const user = await userRepository.findByEmail(email);
    if (!user) throw new AppError('Invalid email or password', 401);

    const isValid = await user.comparePassword(password);
    if (!isValid) throw new AppError('Invalid email or password', 401);

    const token = jwt.sign(
      { user_id: String(user._id), role: user.role },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN as any }
    );

    return {
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    };
  }
}

export const authService = new AuthService();
