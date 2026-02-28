import express, { Request, Response } from 'express';
import cors from 'cors';
import { config } from './config/env';
import router from './routes/index';
import { errorMiddleware } from './middlewares/error.middleware';

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api', router);

// 404
app.use((_req: Request, res: Response) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

// Error handler centralizado (debe ser el último middleware)
app.use(errorMiddleware);

app.listen(config.port, () => {
  console.log(`Servidor iniciado en http://localhost:${config.port}`);
  console.log(`Ambiente: ${config.nodeEnv}`);
});

export default app;
