import { Response, NextFunction } from 'express';
import { userService } from '../services/user.service';
import { AuthRequest, UpdateProfileDto } from '../models/user.model';

export const userController = {
  async getMe(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userService.getProfile(req.user!.userId);
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  },

  async updateMe(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = req.body as UpdateProfileDto;
      const user = await userService.updateProfile(req.user!.userId, data);
      res.status(200).json({ message: 'Perfil actualizado exitosamente', user });
    } catch (error) {
      next(error);
    }
  },

  async listUsers(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await userService.listUsers();
      res.status(200).json({ users, total: users.length });
    } catch (error) {
      next(error);
    }
  },
};
