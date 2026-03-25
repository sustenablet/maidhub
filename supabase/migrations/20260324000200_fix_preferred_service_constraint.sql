-- Remove the CHECK constraint on preferred_service to allow custom service types
-- Users can define their own service types in settings, which shouldn't be restricted here

-- Drop existing constraint if it exists (name may vary)
DO $$
DECLARE
  constraint_name text;
BEGIN
  SELECT conname INTO constraint_name
  FROM pg_constraint
  WHERE conrelid = 'public.clients'::regclass
    AND contype = 'c'
    AND pg_get_constraintdef(oid) LIKE '%preferred_service%';

  IF constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.clients DROP CONSTRAINT %I', constraint_name);
  END IF;
END $$;

-- Ensure the column exists (in case the previous migration wasn't applied)
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS preferred_service text;
