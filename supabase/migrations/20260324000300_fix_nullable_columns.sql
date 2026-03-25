-- ============================================================
-- Emergency schema fixes — apply this in Supabase SQL Editor
-- Fixes all known schema mismatches with the application code
-- ============================================================

-- 1. Add settings column to users (if not already added)
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS settings jsonb NOT NULL DEFAULT '{}';

-- 2. Add preferred_service to clients without CHECK constraint
--    (allows custom service types defined in settings)
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS preferred_service text;

-- Drop any existing CHECK constraint on preferred_service
DO $$
DECLARE
  cname text;
BEGIN
  SELECT conname INTO cname
  FROM pg_constraint
  WHERE conrelid = 'public.clients'::regclass
    AND contype = 'c'
    AND pg_get_constraintdef(oid) LIKE '%preferred_service%';
  IF cname IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.clients DROP CONSTRAINT %I', cname);
  END IF;
END $$;

-- 3. Make jobs.address_id nullable (clients may have no address yet)
ALTER TABLE public.jobs
  ALTER COLUMN address_id DROP NOT NULL;

-- 4. Make recurring_rules.address_id nullable
ALTER TABLE public.recurring_rules
  ALTER COLUMN address_id DROP NOT NULL;

-- 5. Add start_time column to recurring_rules (used by the app)
ALTER TABLE public.recurring_rules
  ADD COLUMN IF NOT EXISTS start_time time;

-- 6. Add notes column to invoices
ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS notes text;
