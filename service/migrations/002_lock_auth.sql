-- Lock Auth hardening
BEGIN;

-- Ensure is_active column exists with proper defaults
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN;

ALTER TABLE public.users
  ALTER COLUMN is_active SET DEFAULT TRUE;

UPDATE public.users
  SET is_active = TRUE
  WHERE is_active IS NULL;

ALTER TABLE public.users
  ALTER COLUMN is_active SET NOT NULL;

-- Deprecate legacy test user safely
UPDATE public.users
  SET is_active = FALSE
  WHERE email = 'user@example.com';

COMMIT;
