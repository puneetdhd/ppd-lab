import { User, IUser } from '../models/User.model';

export class UserRepository {
  async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email });
  }

  async findById(id: string): Promise<IUser | null> {
    return User.findById(id).select('-password');
  }

  async create(data: Partial<IUser>): Promise<IUser> {
    const user = new User(data);
    return user.save();
  }

  async findAll(): Promise<IUser[]> {
    return User.find().select('-password').sort({ createdAt: -1 });
  }
}

export const userRepository = new UserRepository();
