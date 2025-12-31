import express from 'express';
import healthRoutes from './health/health.routes';
import appointmentRoutes from './routes/appointment.routes';
import { errorMiddleware } from './middlewares/error.middleware';
import rateLimit from "express-rate-limit";
import { httpLogger } from './middlewares/logger.middleware';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true, 
  legacyHeaders: false,
});

const app = express();

app.use(express.json());
app.use(limiter);
app.use(healthRoutes);
app.use(httpLogger); // 👈 BEFORE routes

app.use('/api', appointmentRoutes);
app.use(errorMiddleware);


export default app;