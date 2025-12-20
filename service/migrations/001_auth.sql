-- Auth bootstrap migration
-- Adds password hashing support and role mapping for users.

BEGIN;

-- Ensure UUID generator is available for default IDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Add password storage for login verification
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Role catalog
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User-to-role mapping
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, role_id)
);

-- Seed baseline role (additional roles can be managed via standard inserts)
INSERT INTO roles (name)
SELECT 'user'
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'user');

COMMIT;
