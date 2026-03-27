-- Fix organizations RLS: add explicit WITH CHECK for INSERT/UPDATE
-- The previous FOR ALL USING without WITH CHECK can cause PostgREST
-- to fail on .insert().select().single() if the row can't be read back.

DROP POLICY IF EXISTS "Users manage own organizations" ON public.organizations;

CREATE POLICY "Users manage own organizations"
  ON public.organizations FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
