import { Response, NextFunction } from 'express';
import { AuthRequest } from '../models/user.model';

export const adminMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.user?.role !== 'ADMIN') {
    res.status(403).json({ message: 'Acceso denegado: se requiere rol de administrador' });
    return;
  }
  next();
};
