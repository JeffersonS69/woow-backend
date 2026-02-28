import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';

export const authController = {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, email, password } = req.body as { name: string; email: string; password: string };
      const user = await authService.register(name, email, password);
      res.status(201).json({ message: 'Usuario registrado exitosamente', user });
    } catch (error) {
      next(error);
    }
  },

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body as { email: string; password: string };
      const result = await authService.login(email, password);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
};
