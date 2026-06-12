-- Injected helper to allow the syntactically invalid RLS policy in 20250923141017 to compile during bootstrap
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'dummy_approval_type') THEN
    CREATE TYPE dummy_approval_type AS (approval_status text);
  END IF;
END
$$;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS old dummy_approval_type;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS new dummy_approval_type;
