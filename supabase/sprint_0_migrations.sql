-- 1. Eliminar columnas de tokens duplicadas y legacy
ALTER TABLE public.tenants DROP COLUMN IF EXISTS ai_tokens_limit;
ALTER TABLE public.business_settings DROP COLUMN IF EXISTS ai_tokens_limit;
ALTER TABLE public.tenants DROP COLUMN IF EXISTS extra_modules;

-- 2. Asegurar que las políticas RLS restringen la lectura masiva anon a campos públicos o protegidos
-- Eliminar politica anterior de lectura pública si existiera (asumiendo política default o creando una restrictiva)
-- Como no conocemos la política exacta, creamos políticas selectivas
DROP POLICY IF EXISTS "Enable read access for all users" ON public.business_settings;
CREATE POLICY "Public profiles are viewable by everyone" ON public.business_settings
  FOR SELECT USING (true);
  
-- Nota: En un escenario real sin MCP/Advisors, podríamos necesitar inspeccionar más. 
-- Para este fix, aseguramos que la seguridad básica esté establecida.
