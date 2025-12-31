import prisma from '../config/prisma';

export const createAppointment = (data: {
  patientId: string;
  doctorId: string;
  startTime: Date;
  endTime: Date;
}) => {
  return prisma.appointment.create({
    data,
  });
};

export async function getAppointmentsByDoctorAndDate(
  doctorId: string,
  date: string
) {
  const start = new Date(`${date}T00:00:00`);
  const end = new Date(`${date}T23:59:59`);

  return prisma.appointment.findMany({
    where: {
      doctorId,
      startTime: {
        gte: start,
        lte: end,
      },
    },
    orderBy: {
      startTime: 'asc',
    },
  });
}

export async function findAppointmentById(id: string) {
  return prisma.appointment.findUnique({
    where: { id },
  });
}

export async function updateAppointmentTime(
  id: string,
  startTime: Date,
  endTime: Date
) {
  return prisma.appointment.update({
    where: { id },
    data: { startTime, endTime },
  });
}

export async function deleteAppointmentById(id: string) {
  return prisma.appointment.delete({
    where: { id },
  });
}

