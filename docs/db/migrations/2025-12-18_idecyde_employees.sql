CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS idecyde_employees (
  employee_uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  assigned_system TEXT NOT NULL,
  job_title TEXT NOT NULL,
  department TEXT NOT NULL,
  subdepartment TEXT NOT NULL,
  persona_text TEXT NOT NULL,
  skills JSONB NOT NULL DEFAULT '[]',
  interests JSONB NOT NULL DEFAULT '[]',
  avatar_prompt TEXT NULL,
  avatar_image_url TEXT NULL,
  avatar_image_b64 TEXT NULL,
  signature_text TEXT NOT NULL,
  signature_svg TEXT NOT NULL,
  created_by TEXT NOT NULL DEFAULT 'jarvis',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idecyde_employees_department_subdepartment_idx
  ON idecyde_employees (department, subdepartment);

CREATE INDEX IF NOT EXISTS idecyde_employees_assigned_system_idx
  ON idecyde_employees (assigned_system);

CREATE INDEX IF NOT EXISTS idecyde_employees_created_at_desc_idx
  ON idecyde_employees (created_at DESC);
