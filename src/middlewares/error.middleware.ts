import { Request, Response, NextFunction } from 'express';

export function errorMiddleware(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err.message === 'TIME_OVERLAP') {
    return res.status(409).json({
      error: {
        code: 'TIME_OVERLAP',
        message: 'Doctor already has an appointment in this time range',
      },
    });
  }

  if (err.message === 'DOCTOR_ID_REQUIRED') {
    return res.status(400).json({
      error: {
        code: 'DOCTOR_ID_REQUIRED',
        message: 'doctor_id query parameter is required',
      },
    });
  }

  if (err.message === 'APPOINTMENT_NOT_FOUND') {
    return res.status(404).json({
      error: { code: 'APPOINTMENT_NOT_FOUND' },
    });
  }

  if (err.message === 'INVALID_TIME_RANGE') {
    return res.status(400).json({
      error: { code: 'INVALID_TIME_RANGE' },
    });
  }

  if (err.message === 'PATIENT_NOT_FOUND') {
    return res.status(404).json({
      error: {
        code: 'PATIENT_NOT_FOUND',
        message: 'Patient does not exist',
      },
    });
  }

  if (err.message === 'DOCTOR_NOT_FOUND') {
    return res.status(404).json({
      error: {
        code: 'DOCTOR_NOT_FOUND',
        message: 'Doctor does not exist',
      },
    });
  }

  if (err.code === 'P2034') {
    return res.status(409).json({
      error: {
        code: 'CONCURRENT_MODIFICATION',
        message: 'Please retry the request',
      },
    });
  }


  if (err.name === 'ZodError') {
    console.error('ZOD ERROR FROM:', err.stack);
    console.error('ZOD ISSUES:', err.errors);
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: err.errors,
      },
    });
  }

  console.error(err);
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Internal server error',
    },
  });
}
