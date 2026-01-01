import request from 'supertest';
import { describe, it, expect, beforeEach } from 'vitest';
import { app, prisma } from '../setup';

describe('POST /api/appointments', () => {
  beforeEach(async () => {
    await prisma.appointment.deleteMany();
  });

  it('creates appointment', async () => {
    const res = await request(app)
      .post('/api/appointments')
      .set('Idempotency-Key', 'test-1')
      .send({
        patient_id: 'pat_001',
        doctor_id: 'doc_001',
        start_time: '2025-11-15T09:00:00+07:00',
        end_time: '2025-11-15T09:30:00+07:00',
      });

    expect([200, 201]).toContain(res.status);
    expect(res.body.id).toBeDefined();
  });

  it('rejects overlap', async () => {
    await request(app)
      .post('/api/appointments')
      .set('Idempotency-Key', 'test-2')
      .send({
        patient_id: 'pat_001',
        doctor_id: 'doc_001',
        start_time: '2025-11-15T09:00:00+07:00',
        end_time: '2025-11-15T09:30:00+07:00',
      });

    const res = await request(app)
      .post('/api/appointments')
      .set('Idempotency-Key', 'test-3')
      .send({
        patient_id: 'pat_001',
        doctor_id: 'doc_001',
        start_time: '2025-11-15T09:15:00+07:00',
        end_time: '2025-11-15T09:45:00+07:00',
      });

    expect(res.status).toBe(409);
  });
});
