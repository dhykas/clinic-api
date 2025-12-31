import { z } from 'zod';

export const createAppointmentSchema = z.object({
  patient_id: z.string(),
  doctor_id: z.string(),
  start_time: z.string(),
  end_time: z.string(),
});

export const getAppointmentsQuerySchema = z.object({
  doctor_id: z.coerce.string(),
  date: z.coerce.string().optional(),
});

export const rescheduleAppointmentSchema = z.object({
  start_time: z.string(),
  end_time: z.string(),
});

