import { Request, Response, NextFunction } from 'express';

const errorStatusMap: Record<string, number> = {
  'El correo electrónico ya está registrado': 400,
  'El correo ya está en uso': 400,
  'Credenciales inválidas': 401,
  'Usuario no encontrado': 404,
};

export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);

  const status = errorStatusMap[err.message] ?? 500;
  const message = status === 500 ? 'Error interno del servidor' : err.message;

  res.status(status).json({ message });
};
