-- ============================================================
-- Multi-organization support
-- ============================================================

-- 1. ORGANIZATIONS table
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  settings JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own organizations"
  ON public.organizations FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_organizations_user_id ON public.organizations(user_id);

-- 2. Add organization_id to all data tables (nullable for backward compat)
ALTER TABLE public.clients
  ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.addresses
  ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.recurring_rules
  ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.jobs
  ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.estimates
  ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.invoices
  ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.notifications_log
  ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Indexes
CREATE INDEX idx_clients_org_id ON public.clients(organization_id);
CREATE INDEX idx_jobs_org_id ON public.jobs(organization_id);
CREATE INDEX idx_invoices_org_id ON public.invoices(organization_id);
CREATE INDEX idx_recurring_rules_org_id ON public.recurring_rules(organization_id);

-- 3. Create default organization for each existing user
INSERT INTO public.organizations (id, user_id, name, phone, settings, created_at, updated_at)
SELECT
  gen_random_uuid(),
  u.id,
  COALESCE(u.business_name, u.display_name, 'My Business'),
  u.phone,
  COALESCE(u.settings, '{}'::jsonb),
  u.created_at,
  NOW()
FROM public.users u;

-- 4. Migrate existing data to the default organizations
UPDATE public.clients c
SET organization_id = o.id
FROM public.organizations o
WHERE c.user_id = o.user_id;

UPDATE public.addresses a
SET organization_id = o.id
FROM public.organizations o
WHERE a.user_id = o.user_id;

UPDATE public.recurring_rules rr
SET organization_id = o.id
FROM public.organizations o
WHERE rr.user_id = o.user_id;

UPDATE public.jobs j
SET organization_id = o.id
FROM public.organizations o
WHERE j.user_id = o.user_id;

UPDATE public.estimates e
SET organization_id = o.id
FROM public.organizations o
WHERE e.user_id = o.user_id;

UPDATE public.invoices i
SET organization_id = o.id
FROM public.organizations o
WHERE i.user_id = o.user_id;

UPDATE public.notifications_log n
SET organization_id = o.id
FROM public.organizations o
WHERE n.user_id = o.user_id;

-- 5. Update handle_new_user trigger to also create a default organization
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  biz_name TEXT;
BEGIN
  biz_name := COALESCE(
    new.raw_user_meta_data ->> 'business_name',
    new.raw_user_meta_data ->> 'display_name',
    'My Business'
  );

  INSERT INTO public.users (id, display_name, business_name)
  VALUES (
    new.id,
    new.raw_user_meta_data ->> 'display_name',
    biz_name
  );

  INSERT INTO public.organizations (user_id, name)
  VALUES (new.id, biz_name);

  RETURN new;
END;
$$;
