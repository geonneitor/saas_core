-- ============================================================
-- Sprint 6 — Roles de Agente y Stripe Connect Onboarding
-- Fecha: 2026-07-16
-- ============================================================

-- 1. Modificar tabla profiles para añadir stripe y rol
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS stripe_account_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_onboarding_complete BOOLEAN DEFAULT FALSE;

-- Actualizar el check constraint del rol si existe o ignorar si es texto libre
-- Asumiendo que el role puede ser texto. Si es un enum, requeriría alter type.
-- Si hay un check constraint, hay que alterarlo, pero Postgres no permite ALTER CHECK fácilmente sin tirarlo y recrearlo.
-- Por seguridad, si role es TEXT con un check:
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('user', 'super_admin', 'agent'));

-- 2. Modificar tabla tenants para añadir la relación con el agente
ALTER TABLE public.tenants
ADD COLUMN IF NOT EXISTS agent_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Indice para búsquedas rápidas de inquilinos por agente
CREATE INDEX IF NOT EXISTS idx_tenants_agent_id ON public.tenants(agent_id);

-- 3. Actualizar RLS en tenants para que el agente vea sus tenants
-- Asumiendo que existe tenants_owner_all, creamos una para agentes
CREATE POLICY "tenants_agent_read"
  ON public.tenants
  FOR SELECT
  USING (
    agent_id = auth.uid()
  );

CREATE POLICY "tenants_agent_update"
  ON public.tenants
  FOR UPDATE
  USING (
    agent_id = auth.uid()
  );

-- 4. Actualizar RLS en business_settings
CREATE POLICY "business_settings_agent_read"
  ON public.business_settings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.tenants
      WHERE tenants.id = business_settings.tenant_id
      AND tenants.agent_id = auth.uid()
    )
  );

CREATE POLICY "business_settings_agent_update"
  ON public.business_settings
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.tenants
      WHERE tenants.id = business_settings.tenant_id
      AND tenants.agent_id = auth.uid()
    )
  );
