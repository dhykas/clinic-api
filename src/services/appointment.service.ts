import prisma from '../config/prisma';
import { createAppointment, deleteAppointmentById } from '../repositories/appointment.repository';
import { getAppointmentsByDoctorAndDate } from '../repositories/appointment.repository';


export async function createAppointmentService(input: {
  patientId: string;
  doctorId: string;
  startTime: Date;
  endTime: Date;
}) {
  const overlap = await prisma.appointment.findFirst({
    where: {
      doctorId: input.doctorId,
      startTime: { lt: input.endTime },
      endTime: { gt: input.startTime },
    },
  });

  if (overlap) {
    throw new Error('TIME_OVERLAP');
  }
  
  // ⛔ invalid time
  if (input.startTime >= input.endTime) {
    throw new Error('INVALID_TIME_RANGE');
  }

  // ✅ validate patient
  const patient = await prisma.patient.findUnique({
    where: { id: input.patientId },
  });

  if (!patient) {
    throw new Error('PATIENT_NOT_FOUND');
  }

  // ✅ validate doctor
  const doctor = await prisma.doctor.findUnique({
    where: { id: input.doctorId },
  });

  if (!doctor) {
    throw new Error('DOCTOR_NOT_FOUND');
  }

  try {
    return await createAppointment(input);
  } catch (err: any) {
    if (err.code === 'P2002' || err.message?.includes('no_overlap')) {
      throw new Error('TIME_OVERLAP');
    }
    throw err;
  }
}

export async function getAppointmentsService(
  doctorId: string,
  date?: string
) {
  if (!doctorId) {
    throw new Error('DOCTOR_ID_REQUIRED');
  }

  if (!date) {
    return [];
  }

  return getAppointmentsByDoctorAndDate(doctorId, date);
}

export async function rescheduleAppointmentService(
  id: string,
  startTime: Date,
  endTime: Date
) {
  if (startTime >= endTime) {
    throw new Error('INVALID_TIME_RANGE');
  }

  return prisma.$transaction(
    async (tx) => {
      const appointment = await tx.appointment.findUnique({
        where: { id },
      });

      if (!appointment) {
        throw new Error('APPOINTMENT_NOT_FOUND');
      }

      const overlap = await tx.appointment.findFirst({
        where: {
          doctorId: appointment.doctorId,
          id: { not: id },
          startTime: { lt: endTime },
          endTime: { gt: startTime },
        },
      });

      if (overlap) {
        throw new Error('TIME_OVERLAP');
      }

      return tx.appointment.update({
        where: { id },
        data: { startTime, endTime },
      });
    },
    {
      isolationLevel: 'Serializable',
    }
  );
}

export async function deleteAppointmentService(id: string) {
  try {
    await deleteAppointmentById(id);
  } catch (err: any) {
    if (err.code === 'P2025') {
      throw new Error('APPOINTMENT_NOT_FOUND');
    }
    throw err;
  }
}
