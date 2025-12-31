import { Router } from 'express';
import { createAppointment, deleteAppointment, getAppointments, rescheduleAppointment } from '../controllers/appointment.controller';
import { idempotencyMiddleware } from '../middlewares/idempotency.middleware';

const router = Router();

router.get('/appointments', getAppointments);
router.post('/appointments', idempotencyMiddleware, createAppointment);
router.patch('/appointments/:id', idempotencyMiddleware, rescheduleAppointment);
router.delete('/appointments/:id', deleteAppointment);

export default router;
