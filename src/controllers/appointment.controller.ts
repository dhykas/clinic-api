import { Request, Response, NextFunction } from 'express';
import { createAppointmentSchema, getAppointmentsQuerySchema, rescheduleAppointmentSchema } from '../validators/appointment.schema';
import { createAppointmentService, deleteAppointmentService, getAppointmentsService, rescheduleAppointmentService } from '../services/appointment.service';
import prisma from '../config/prisma';

export async function getAppointments(
  req: Request,
  res: Response,
  next: NextFunction
) {

  try {
    const query = getAppointmentsQuerySchema.parse(req.query);

    const appointments = await getAppointmentsService(
      query.doctor_id,
      query.date
    );

    res.json(appointments);
  } catch (err) {
    next(err);
  }
}
export async function createAppointment(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const body = createAppointmentSchema.parse(req.body);

    const appointment = await createAppointmentService({
      patientId: body.patient_id,
      doctorId: body.doctor_id,
      startTime: new Date(body.start_time),
      endTime: new Date(body.end_time),
    });

    const response = {
      id: appointment.id,
      status: appointment.status,
    };

    if (res.locals.idempotency) {
      await prisma.idempotencyKey.create({
        data: {
          key: res.locals.idempotency.key,
          requestHash: res.locals.idempotency.requestHash,
          response,
        },
      });
    }


    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
}
export async function rescheduleAppointment(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const body = rescheduleAppointmentSchema.parse(req.body);

    const appointment = await rescheduleAppointmentService(
      id,
      new Date(body.start_time),
      new Date(body.end_time)
    );

    const response = {
      id: appointment.id,
      status: "RESCHEDULED",
      startTime: appointment.startTime,
      endTime: appointment.endTime,
    };

    if (res.locals.idempotency) {
      await prisma.idempotencyKey.create({
        data: {
          key: res.locals.idempotency.key,
          requestHash: res.locals.idempotency.requestHash,
          response,
        },
      });
    }


    res.json(response);
  } catch (err) {
    next(err);
  }
}

export async function deleteAppointment(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;

    await deleteAppointmentService(id);

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
