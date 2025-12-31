import { describe, it, expect, beforeEach } from 'vitest';
import prisma from '../../config/prisma';
import { createAppointmentService } from '../../services/appointment.service';

describe('createAppointmentService', () => {
  beforeEach(async () => {
    await prisma.appointment.deleteMany();
  });

  it('throws INVALID_TIME_RANGE', async () => {
    await expect(
      createAppointmentService({
        patientId: 'pat_001',
        doctorId: 'doc_001',
        startTime: new Date('2025-11-15T10:00:00'),
        endTime: new Date('2025-11-15T09:00:00'),
      })
    ).rejects.toThrow('INVALID_TIME_RANGE');
  });

  it('throws PATIENT_NOT_FOUND', async () => {
    await expect(
      createAppointmentService({
        patientId: 'pat_x',
        doctorId: 'doc_001',
        startTime: new Date(),
        endTime: new Date(Date.now() + 1000),
      })
    ).rejects.toThrow('PATIENT_NOT_FOUND');
  });

  it('creates appointment successfully', async () => {
    const appt = await createAppointmentService({
      patientId: 'pat_001',
      doctorId: 'doc_001',
      startTime: new Date('2025-11-15T09:00:00'),
      endTime: new Date('2025-11-15T09:30:00'),
    });

    expect(appt.id).toBeDefined();
  });
});
