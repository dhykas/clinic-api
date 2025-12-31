CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE "Appointment"
ADD CONSTRAINT no_overlap_per_doctor
EXCLUDE USING GIST (
  "doctorId" WITH =,
  tsrange("startTime", "endTime") WITH &&
);
