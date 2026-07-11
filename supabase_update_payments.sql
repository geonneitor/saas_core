-- ==========================================
-- SPRINT 9: Monetización, Módulos (Add-ons) y Referidos
-- Ejecuta este script en el Editor SQL de tu Supabase
-- ==========================================

-- 1. Añadir columnas de Pagos y Módulos Activos
ALTER TABLE public.tenants
ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'active', -- 'pending_setup', 'active', 'suspended'
ADD COLUMN IF NOT EXISTS active_modules jsonb DEFAULT '["core"]'::jsonb;

-- 2. Sistema de Referidos (Growth Loop)
ALTER TABLE public.tenants
ADD COLUMN IF NOT EXISTS referral_code text UNIQUE,
ADD COLUMN IF NOT EXISTS referred_by uuid REFERENCES public.tenants(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS referrals_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS available_rewards jsonb DEFAULT '[]'::jsonb;

-- 3. Trigger para autogenerar el código de referido al crear un Tenant (opcional, por ahora lo podemos generar desde la app)

-- Refrescar la caché del schema para PostgREST
NOTIFY pgrst, 'reload schema';
