import { Router, Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { authMiddleware } from '../middlewares/auth.middleware';
import { adminMiddleware } from '../middlewares/admin.middleware';
import { userController } from '../controllers/user.controller';
import { AuthRequest } from '../models/user.model';

const router = Router();

const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const errors = error.details.map((d) => d.message);
      res.status(400).json({ message: 'Datos de entrada inválidos', errors });
      return;
    }
    next();
  };
};

const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional().messages({
    'string.min': 'El nombre debe tener al menos 2 caracteres',
    'string.max': 'El nombre no puede superar los 100 caracteres',
  }),
  email: Joi.string().email().optional().messages({
    'string.email': 'El correo electrónico no es válido',
  }),
  password: Joi.string().min(8).optional().messages({
    'string.min': 'La contraseña debe tener al menos 8 caracteres',
  }),
}).min(1).messages({
  'object.min': 'Debe enviar al menos un campo para actualizar',
});

router.use(authMiddleware as (req: Request, res: Response, next: NextFunction) => void);
router.get('/me', userController.getMe as (req: AuthRequest, res: Response, next: NextFunction) => void);
router.put(
  '/me',
  validate(updateProfileSchema),
  userController.updateMe as (req: AuthRequest, res: Response, next: NextFunction) => void
);
router.get(
  '/',
  adminMiddleware as (req: Request, res: Response, next: NextFunction) => void,
  userController.listUsers as (req: AuthRequest, res: Response, next: NextFunction) => void
);

export default router;
