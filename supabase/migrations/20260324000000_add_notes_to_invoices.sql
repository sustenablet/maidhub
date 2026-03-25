-- Add notes column to invoices table
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS notes text;
