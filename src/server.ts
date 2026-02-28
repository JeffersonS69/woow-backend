import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { config } from './config/env';

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// 404
app.use((_req: Request, res: Response) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

// Error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(`[ERROR]:`, err.message);
  res.status(500).json({ message: 'Error interno del servidor' });
});

app.listen(config.port, () => {
  console.log(`Servidor iniciado en http://localhost:${config.port}`);
  console.log(`Ambiente: ${config.nodeEnv}`);
});

export default app;
