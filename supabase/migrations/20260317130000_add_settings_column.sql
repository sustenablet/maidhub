-- Add settings JSONB column to users table for business & notification preferences
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS settings jsonb NOT NULL DEFAULT '{}';
