import request from 'supertest';
import { describe, it, expect, beforeEach } from 'vitest';
import { app, prisma } from '../setup';

describe('Concurrent reschedule race', () => {
  beforeEach(async () => {
    await prisma.idempotencyKey.deleteMany();
    await prisma.appointment.deleteMany();
  });

  it('allows at most one reschedule', async () => {
    const create = await request(app)
      .post('/api/appointments')
      .send({
        patient_id: 'pat_001',
        doctor_id: 'doc_001',
        start_time: '2025-11-15T09:00:00+07:00',
        end_time: '2025-11-15T09:30:00+07:00',
      });

    const id = create.body.id;

    const payload = {
      start_time: '2025-11-15T10:00:00+07:00',
      end_time: '2025-11-15T10:30:00+07:00',
    };

    const [r1, r2] = await Promise.all([
      request(app).patch(`/api/appointments/${id}`).send(payload),
      request(app).patch(`/api/appointments/${id}`).send(payload),
    ]);

    const success = [r1, r2].filter(
      (r) => r.status === 200 && r.body.status === 'RESCHEDULED'
    );

    expect(success.length).toBeLessThanOrEqual(1);
  });
});
