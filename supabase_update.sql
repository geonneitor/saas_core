-- ==========================================
-- SPRINT 8 (corregido): AI Control Center & Limits
-- Estado: 2026-07-12 — Aplica solo lo que falta en DB real
-- ==========================================
-- CONTEXTO:
--   DB real verificada via PostgREST ya tiene:
--     - ai_token_limit (sin "s")   ← ESTA es la que el código lee
--     - ai_tokens_limit (con "s")  ← huérfana, creada por error
--     - ai_tokens_used             ← existe
--   DB real NO tiene:
--     - extra_modules (huérfana, en tenants y business_settings)
--     - ai_tone, services_json, ai_rules (en business_settings)
--
-- Este script:
--   1. ELIMINA las columnas duplicadas/huérfanas
--   2. AÑADE las columnas que sí faltan

-- 1. LIMPIEZA: eliminar columnas duplicadas/huérfanas
ALTER TABLE public.tenants
DROP COLUMN IF EXISTS ai_tokens_limit;  -- duplicado de ai_token_limit
ALTER TABLE public.tenants
DROP COLUMN IF EXISTS extra_modules;     -- legacy, no se usa en código
ALTER TABLE public.business_settings
DROP COLUMN IF EXISTS extra_modules;     -- legacy, no se usa en código
ALTER TABLE public.business_settings
DROP COLUMN IF EXISTS ai_tokens_limit;   -- duplicado

-- 2. AÑADIR lo que el código sí espera y la DB no tiene
ALTER TABLE public.business_settings
ADD COLUMN IF NOT EXISTS ai_tone text DEFAULT 'VIP y Exclusivo',
ADD COLUMN IF NOT EXISTS services_json jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS ai_rules text DEFAULT 'No agendar citas fuera de horario.';

-- 3. ASEGURAR el límite correcto (idempotente)
ALTER TABLE public.tenants
ADD COLUMN IF NOT EXISTS ai_token_limit integer DEFAULT 100000;

-- 4. Refrescar caché de PostgREST
NOTIFY pgrst, 'reload schema';

-- 5. VERIFICACIÓN POST-EJECUCIÓN (ejecutar manualmente):
-- SELECT column_name FROM information_schema.columns
-- WHERE table_name = 'tenants' AND column_name LIKE '%token%';
-- Esperado: solo 'ai_token_limit' y 'ai_tokens_used'
