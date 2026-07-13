-- 1. Columna para soft-delete
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS deleted_at timestamptz NULL;

-- 2. Tabla de audit log
CREATE TABLE IF NOT EXISTS public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid NOT NULL,
  action text NOT NULL,
  target_id uuid,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_actor ON public.audit_log(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON public.audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON public.audit_log(created_at DESC);

-- 3. Función helper is_super_admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_role text;
BEGIN
  SELECT role INTO v_role FROM public.profiles WHERE id = auth.uid();
  RETURN v_role = 'super_admin';
END;
$$;

-- 4. RPC: suspender tenant (soft-delete)
CREATE OR REPLACE FUNCTION public.suspend_tenant(p_tenant_id uuid, p_reason text DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT public.is_super_admin() THEN
    RAISE EXCEPTION 'Access denied: super_admin role required';
  END IF;

  UPDATE public.tenants
  SET is_active = false, deleted_at = now()
  WHERE id = p_tenant_id AND deleted_at IS NULL;

  INSERT INTO public.audit_log (actor_id, action, target_id, metadata)
  VALUES (auth.uid(), 'suspend_tenant', p_tenant_id, jsonb_build_object('reason', p_reason));

  RETURN true;
END;
$$;

-- 5. RPC: actualizar límite de tokens
CREATE OR REPLACE FUNCTION public.update_tenant_token_limit(p_tenant_id uuid, p_new_limit int)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT public.is_super_admin() THEN
    RAISE EXCEPTION 'Access denied: super_admin role required';
  END IF;

  IF p_new_limit < 0 OR p_new_limit > 1000000 THEN
    RAISE EXCEPTION 'Invalid limit: must be between 0 and 1,000,000';
  END IF;

  UPDATE public.tenants
  SET ai_token_limit = p_new_limit
  WHERE id = p_tenant_id;

  INSERT INTO public.audit_log (actor_id, action, target_id, metadata)
  VALUES (auth.uid(), 'update_token_limit', p_tenant_id, jsonb_build_object('new_limit', p_new_limit));

  RETURN true;
END;
$$;

-- 6. RPC: hard-delete (solo casos extremos, GDPR)
CREATE OR REPLACE FUNCTION public.delete_tenant_permanently(p_tenant_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT public.is_super_admin() THEN
    RAISE EXCEPTION 'Access denied: super_admin role required';
  END IF;

  -- Cascade manual
  DELETE FROM public.appointments WHERE tenant_id = p_tenant_id;
  DELETE FROM public.customers WHERE tenant_id = p_tenant_id;
  DELETE FROM public.wallet_transactions WHERE tenant_id = p_tenant_id;
  DELETE FROM public.business_settings WHERE tenant_id = p_tenant_id;
  DELETE FROM public.tenants WHERE id = p_tenant_id;

  INSERT INTO public.audit_log (actor_id, action, target_id)
  VALUES (auth.uid(), 'delete_tenant_permanently', p_tenant_id);

  RETURN true;
END;
$$;

-- 7. RLS en audit_log
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "audit_log_super_admin_read" ON public.audit_log;
CREATE POLICY "audit_log_super_admin_read"
ON public.audit_log
FOR SELECT
TO authenticated
USING (public.is_super_admin());

-- Nota: La policy "tenants_super_admin_all" NO se ha aplicado aquí para evitar romper la lógica de la landing pública de los tenants.
