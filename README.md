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

## Prerequisites

Pastikan Anda sudah menginstall:
- Node.js (versi 18 atau lebih tinggi)
- npm atau yarn
- PostgreSQL atau MySQL (sesuai pilihan)

## Installation

### 1. Clone repository

```bash
git clone <repository-url>
cd <project-name>
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup environment variables

Buat file `.env` di root folder:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
# Untuk MySQL gunakan:
# DATABASE_URL="mysql://user:password@localhost:3306/dbname"

# Server
PORT=3000
NODE_ENV=development

```

### 4. Setup Prisma

Generate Prisma Client:

```bash
npx prisma generate
```

Jalankan migrasi database:

```bash
npx prisma migrate dev --name init
```

(Opsional) Seed database:

```bash
npx prisma db seed
```

## Project Structure

```
├── prisma/
│   ├── schema.prisma      # Prisma schema
│   └── migrations/        # Database migrations
├── src/
│   ├── controllers/       # Route controllers
│   ├── routes/            # API routes
│   ├── middlewares/       # Custom middlewares
│   ├── services/          # Business logic
│   ├── utils/             # Helper functions
│   ├── types/             # TypeScript types
│   └── app.ts             # Entry point
├── .env                   # Environment variables
├── .gitignore
├── package.json
├── tsconfig.json          # TypeScript config
└── README.md
```

## Development

Jalankan development server dengan hot reload:

```bash
npm run dev
```

Server akan berjalan di `http://localhost:3000`

## Build

Compile TypeScript ke JavaScript:

```bash
npm run build
```

Jalankan production build:

```bash
npm start
```

## Available Scripts

- `npm run dev` - Jalankan development server dengan nodemon
- `npm run build` - Compile TypeScript
- `npm start` - Jalankan production server
- `npm seed` - Seeding data ke database
- `npm test` - testing service dan integerasi data
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Jalankan database migration
- `npm run prisma:studio` - Buka Prisma Studio (GUI database)

## Prisma Commands

### Migrasi Database

Buat migration baru:
```bash
npx prisma migrate dev --name <migration-name>
```

Reset database:
```bash
npx prisma migrate reset
```

### Prisma Studio

Buka GUI untuk melihat dan mengedit data:
```bash
npx prisma studio
```

### Update Schema

Setelah mengubah `schema.prisma`:
```bash
npx prisma generate
npx prisma migrate dev
```

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

| Code                     | Description                      |
| ------------------------ | -------------------------------- |
| INVALID_TIME_RANGE       | Waktu tidak valid                |
| TIME_OVERLAP             | Jadwal dokter bentrok            |
| PATIENT_NOT_FOUND        | Patient tidak ditemukan          |
| DOCTOR_NOT_FOUND         | Doctor tidak ditemukan           |
| APPOINTMENT_NOT_FOUND    | Appointment tidak ada            |
| IDEMPOTENCY_KEY_CONFLICT | Reuse key dengan payload berbeda |
| VALIDATION_ERROR         | Schema validation error          |

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

```bash
docker-compose up -d
```

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

```yaml
openapi: 3.0.3
info:
  title: Clinic Appointment API
  version: 1.0.0
  description: |
    API for managing doctor–patient appointments with idempotent writes
    and strong guarantees against double-booking.

servers:
  - url: http://localhost:3000

components:
  securitySchemes:
    ApiKeyAuth:
      type: apiKey
      in: header
      name: X-API-Key

  schemas:
    AppointmentCreateRequest:
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

    AppointmentResponse:
      type: object
      properties:
        id:
          type: string
        status:
          type: string
          example: CONFIRMED

    ErrorResponse:
      type: object
      properties:
        error:
          type: object
          properties:
            code:
              type: string
            message:
              type: string
            correlation_id:
              type: string

security:
  - ApiKeyAuth: []

paths:
  /appointments:
    post:
      summary: Create appointment (idempotent)
      parameters:
        - in: header
          name: Idempotency-Key
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/AppointmentCreateRequest"
      responses:
        "201":
          description: Appointment created
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/AppointmentResponse"
        "409":
          description: Time overlap conflict
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ErrorResponse"

    get:
      summary: List appointments by doctor and date
      parameters:
        - in: query
          name: doctor_id
          schema:
            type: string
        - in: query
          name: date
          description: YYYY-MM-DD
          schema:
            type: string
      responses:
        "200":
          description: Appointment list

  /appointments/{id}:
    patch:
      summary: Reschedule appointment
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                start_time:
                  type: string
                  format: date-time
                end_time:
                  type: string
                  format: date-time
                reason:
                  type: string
      responses:
        "200":
          description: Appointment rescheduled
        "409":
          description: Time overlap conflict

    delete:
      summary: Cancel appointment
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: string
      responses:
        "204":
          description: Appointment cancelled

  /healthz:
    get:
      summary: Liveness probe
      responses:
        "200":
          description: OK

  /readyz:
    get:
      summary: Readiness probe
      responses:
        "200":
          description: Ready
```
