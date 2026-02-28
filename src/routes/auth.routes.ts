import { Router, Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { authController } from '../controllers/auth.controller';

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

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.min': 'El nombre debe tener al menos 2 caracteres',
    'string.max': 'El nombre no puede superar los 100 caracteres',
    'any.required': 'El nombre es requerido',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'El correo electrónico no es válido',
    'any.required': 'El correo electrónico es requerido',
  }),
  password: Joi.string().min(8).required().messages({
    'string.min': 'La contraseña debe tener al menos 8 caracteres',
    'any.required': 'La contraseña es requerida',
  }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'El correo electrónico no es válido',
    'any.required': 'El correo electrónico es requerido',
  }),
  password: Joi.string().required().messages({
    'any.required': 'La contraseña es requerida',
  }),
});

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);

export default router;
