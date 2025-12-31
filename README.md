# 🏥 Clinic API

Clinic API adalah backend service untuk sistem appointment klinik yang dirancang dengan fokus pada **data consistency**, **idempotency**, dan **race-condition safety**.

---

## 🚀 Tech Stack

- Node.js + Express
- TypeScript
- Prisma ORM
- PostgreSQL
- Zod (Validation)
- Pino (Logging)
- Vitest + Supertest (Testing)
- Docker & Docker Compose

---

## ✨ Features

### Appointment Management
- Create appointment
- Get appointment by doctor & date
- Reschedule appointment
- Delete appointment

### Reliability & Safety
- ✅ Idempotency Key (POST & PATCH)
- ✅ Serializable transaction
- ✅ Overlapping appointment prevention
- ✅ Race-condition safe
- ✅ Consistent error handling

### Testing
- Unit Test (service & util)
- Integration Test (real DB)
- Race Test (concurrent requests)

---

## 📦 API Endpoints

### Health
GET /health

### Appointments
GET /api/appointments
POST /api/appointments
PATCH /api/appointments/:id
DELETE /api/appointments/:id

---

## 🔐 Idempotency

Gunakan header berikut untuk request `POST` dan `PATCH`:

Idempotency-Key: unique-key

Behavior:
- Key sama + payload sama → response diambil dari cache
- Key sama + payload berbeda → `409 CONFLICT`

---

## ⚠️ Error Codes

| Code | Description |
|-----|------------|
| INVALID_TIME_RANGE | Waktu tidak valid |
| TIME_OVERLAP | Jadwal dokter bentrok |
| PATIENT_NOT_FOUND | Patient tidak ditemukan |
| DOCTOR_NOT_FOUND | Doctor tidak ditemukan |
| APPOINTMENT_NOT_FOUND | Appointment tidak ada |
| IDEMPOTENCY_KEY_CONFLICT | Reuse key dengan payload berbeda |
| VALIDATION_ERROR | Schema validation error |


---

## 🧪 Testing

```bash
# Semua test
npm test

# Race condition test
npm run test:race

```

---

## 🐳 Docker

docker-compose up -d

---

## 📊 Logging
- JSON structured logging (Pino)

- Log level berdasarkan HTTP status

- Cocok untuk ELK / Loki / Datadog

---

## 🧠 Architecture
- Controller → HTTP layer

- Service → business logic

- Repository → database access

- Transaction isolation: SERIALIZABLE

- Idempotency via database (tanpa Redis)

---


## 📄 MIT License


---

## 📘 `openapi.yaml`

```yaml
openapi: 3.0.3
info:
  title: Clinic API
  description: Appointment scheduling API with idempotency and race safety
  version: 1.0.0

servers:
  - url: http://localhost:3000

paths:
  /health:
    get:
      summary: Health check
      responses:
        '200':
          description: OK

  /api/appointments:
    get:
      summary: Get appointments by doctor and date
      parameters:
        - in: query
          name: doctor_id
          required: true
          schema:
            type: string
        - in: query
          name: date
          required: false
          schema:
            type: string
            example: 2025-11-15
      responses:
        '200':
          description: Appointment list

    post:
      summary: Create appointment
      parameters:
        - in: header
          name: Idempotency-Key
          required: false
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateAppointment'
      responses:
        '201':
          description: Created
        '409':
          description: Time overlap

  /api/appointments/{id}:
    patch:
      summary: Reschedule appointment
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: string
        - in: header
          name: Idempotency-Key
          required: false
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/RescheduleAppointment'
      responses:
        '200':
          description: Rescheduled
        '409':
          description: Time overlap

    delete:
      summary: Delete appointment
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: string
      responses:
        '204':
          description: Deleted

components:
  schemas:
    CreateAppointment:
      type: object
      required:
        - patient_id
        - doctor_id
        - start_time
        - end_time
      properties:
        patient_id:
          type: string
        doctor_id:
          type: string
        start_time:
          type: string
          format: date-time
        end_time:
          type: string
          format: date-time

    RescheduleAppointment:
      type: object
      required:
        - start_time
        - end_time
      properties:
        start_time:
          type: string
          format: date-time
        end_time:
          type: string
          format: date-time

