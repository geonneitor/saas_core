-- ============================================================
-- Sprint 4 — WhatsApp Inbox + Tenant Resolution Infrastructure
-- Fecha: 2026-07-16
-- ============================================================

-- 1. Tabla wa_inbox: Cola de mensajes entrantes de WhatsApp
--    El webhook responde 200 inmediato y persiste aquí.
--    Un cron job o proceso async recoje los 'pending' y los procesa.
CREATE TABLE IF NOT EXISTS public.wa_inbox (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  sender_phone TEXT NOT NULL,
  receiver_phone TEXT NOT NULL,
  message_text TEXT,
  message_type TEXT DEFAULT 'text',
  raw_payload JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'done', 'error')),
  error_message TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para wa_inbox
CREATE INDEX IF NOT EXISTS idx_wa_inbox_status ON public.wa_inbox(status);
CREATE INDEX IF NOT EXISTS idx_wa_inbox_tenant_id ON public.wa_inbox(tenant_id);
CREATE INDEX IF NOT EXISTS idx_wa_inbox_sender_phone ON public.wa_inbox(sender_phone);
CREATE INDEX IF NOT EXISTS idx_wa_inbox_created_at ON public.wa_inbox(created_at DESC);

-- Comentarios
COMMENT ON TABLE public.wa_inbox IS 'Cola de mensajes entrantes de WhatsApp. El webhook inserta aquí y responde 200.';
COMMENT ON COLUMN public.wa_inbox.status IS 'pending → processing → done | error';
COMMENT ON COLUMN public.wa_inbox.raw_payload IS 'Payload original de Meta para reprocesamiento';

-- RLS: Solo el super-admin o service_role pueden leer wa_inbox (no hay sesión de usuario en webhook)
ALTER TABLE public.wa_inbox ENABLE ROW LEVEL SECURITY;

-- Policy: Super admins pueden ver todo
CREATE POLICY "wa_inbox_super_admin_all"
  ON public.wa_inbox
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Policy: Tenants owners pueden ver sus propios mensajes
CREATE POLICY "wa_inbox_tenant_owner_read"
  ON public.wa_inbox
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.tenants
      WHERE id = wa_inbox.tenant_id AND owner_id = auth.uid()
    )
  );


-- 2. Índice para búsqueda rápida de tenant por número WhatsApp
CREATE INDEX IF NOT EXISTS idx_business_settings_whatsapp_number
  ON public.business_settings(whatsapp_number);


-- 3. Función RPC: wa_receive_message
--    Atómica: busca tenant por número receptor + inserta en wa_inbox.
--    Retorna el ID del mensaje insertado o lanza error si no hay tenant.
CREATE OR REPLACE FUNCTION public.wa_receive_message(
  p_sender_phone TEXT,
  p_receiver_phone TEXT,
  p_message_text TEXT,
  p_message_type TEXT DEFAULT 'text',
  p_raw_payload JSONB DEFAULT NULL::JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_tenant_id UUID;
  v_inbox_id UUID;
BEGIN
  -- Normalizar: solo dígitos
  p_sender_phone := regexp_replace(p_sender_phone, '\D', '', 'g');
  p_receiver_phone := regexp_replace(p_receiver_phone, '\D', '', 'g');

  -- Resolver tenant por número WhatsApp del negocio
  SELECT tenant_id INTO v_tenant_id
  FROM public.business_settings
  WHERE whatsapp_number = p_receiver_phone;

  IF v_tenant_id IS NULL THEN
    RAISE EXCEPTION 'TENANT_NOT_FOUND: no tenant with whatsapp_number %', p_receiver_phone;
  END IF;

  -- Insertar en inbox
  INSERT INTO public.wa_inbox (tenant_id, sender_phone, receiver_phone, message_text, message_type, raw_payload, status)
  VALUES (v_tenant_id, p_sender_phone, p_receiver_phone, p_message_text, p_message_type, p_raw_payload, 'pending')
  RETURNING id INTO v_inbox_id;

  RETURN v_inbox_id;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.wa_receive_message(TEXT, TEXT, TEXT, TEXT, JSONB) TO service_role;
GRANT EXECUTE ON FUNCTION public.wa_receive_message(TEXT, TEXT, TEXT, TEXT, JSONB) TO authenticated;


-- 4. Función RPC: wa_get_pending_messages
--    Para el cron job: obtiene mensajes pendientes por procesar.
CREATE OR REPLACE FUNCTION public.wa_get_pending_messages(
  p_limit INT DEFAULT 10
)
RETURNS TABLE(
  id UUID,
  tenant_id UUID,
  sender_phone TEXT,
  message_text TEXT,
  message_type TEXT,
  raw_payload JSONB,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  UPDATE public.wa_inbox
  SET status = 'processing'
  WHERE id IN (
    SELECT id FROM public.wa_inbox
    WHERE status = 'pending'
    ORDER BY created_at ASC
    LIMIT p_limit
    FOR UPDATE SKIP LOCKED
  )
  RETURNING
    id,
    tenant_id,
    sender_phone,
    message_text,
    message_type,
    raw_payload,
    created_at;
END;
$$;

GRANT EXECUTE ON FUNCTION public.wa_get_pending_messages(INT) TO service_role;
GRANT EXECUTE ON FUNCTION public.wa_get_pending_messages(INT) TO authenticated;


-- 5. Función RPC: wa_mark_message_processed
CREATE OR REPLACE FUNCTION public.wa_mark_message_processed(
  p_message_id UUID,
  p_error_message TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.wa_inbox
  SET
    status = CASE WHEN p_error_message IS NULL THEN 'done' ELSE 'error' END,
    processed_at = now(),
    error_message = p_error_message
  WHERE id = p_message_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.wa_mark_message_processed(UUID, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.wa_mark_message_processed(UUID, TEXT) TO authenticated;


-- 6. Función helper: wa_get_conversation_history
--    Retorna últimos N mensajes de un remitente para dar contexto al LLM.
CREATE OR REPLACE FUNCTION public.wa_get_conversation_history(
  p_sender_phone TEXT,
  p_limit INT DEFAULT 10
)
RETURNS TABLE(
  id UUID,
  tenant_id UUID,
  sender_phone TEXT,
  message_text TEXT,
  message_type TEXT,
  status TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  p_sender_phone := regexp_replace(p_sender_phone, '\D', '', 'g');

  RETURN QUERY
  SELECT
    wi.id,
    wi.tenant_id,
    wi.sender_phone,
    wi.message_text,
    wi.message_type,
    wi.status,
    wi.created_at
  FROM public.wa_inbox wi
  WHERE wi.sender_phone = p_sender_phone AND wi.status = 'done'
  ORDER BY wi.created_at DESC
  LIMIT p_limit;
END;
$$;

GRANT EXECUTE ON FUNCTION public.wa_get_conversation_history(TEXT, INT) TO service_role;
GRANT EXECUTE ON FUNCTION public.wa_get_conversation_history(TEXT, INT) TO authenticated;
