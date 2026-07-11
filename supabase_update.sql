-- ==========================================
-- SPRINT 8: AI Control Center & Limits Update
-- Ejecuta este script en el Editor SQL de tu Supabase
-- ==========================================

-- 1. Ampliar el cerebro de la IA en business_settings
ALTER TABLE public.business_settings
ADD COLUMN IF NOT EXISTS ai_tone text DEFAULT 'VIP y Exclusivo',
ADD COLUMN IF NOT EXISTS services_json jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS ai_rules text DEFAULT 'No agendar citas fuera de horario.';

-- 2. Sistema de Seguridad y Límites (Trial Protection)
-- Añadimos la columna de límite a los tenants (ai_tokens_used asumo que ya existía del Sprint 4, pero lo reaseguramos)
ALTER TABLE public.tenants
ADD COLUMN IF NOT EXISTS ai_token_limit integer DEFAULT 100000, -- Límite generoso por defecto para evitar bloqueos inmediatos
ADD COLUMN IF NOT EXISTS ai_tokens_used integer DEFAULT 0;

-- 3. Refrescar la caché del schema para PostgREST
NOTIFY pgrst, 'reload schema';
