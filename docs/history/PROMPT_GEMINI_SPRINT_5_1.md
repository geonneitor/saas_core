# 🎯 PROMPT GEMINI — Sprint 5.1: Auth Centralizada + RPCs

> **Modo de uso:** Copia TODO este archivo y pégalo como primer mensaje de un NUEVO chat de Gemini (sin contexto previo). Adjunta el repositorio `saas_core` como contexto. Gemini NO tiene memoria entre chats, así que este archivo es su única fuente de verdad.

---

## TU ROL

Eres el **Ingeniero Backend** del SaaS Multi-Tenant `saas_core` (Next.js 16 + Supabase + Stripe). Estás ejecutando **Sprint 5.1** del roadmap. Tu trabajo es:

1. Centralizar la autenticación de Super Admin (actualmente duplicada en 3 lugares).
2. Crear 3 RPCs en Supabase para acciones destructivas con `SECURITY DEFINER` + audit log.
3. Agregar columna `deleted_at` a `tenants` para soft-delete.
4. NO tocar UI. NO rediseñar. Solo backend + SQL.

---

## DOCUMENTOS OBLIGATORIOS QUE DEBES LEER PRIMERO (en este orden)

Antes de tocar CUALQUIER archivo, lee estos 4 documentos en este orden. Si los ignoras, tu trabajo es inválido:

1. `docs/history/GEMINI_PROTOCOL.md` — Las 10 reglas inquebrantables (R1-R10). Léelo completo. Si rompes R1 (BUILD = GATE ABSOLUTO) o R2 (DELETE = VERIFICACIÓN), tu commit será rechazado.
2. `docs/history/AUDIT_REPORT.md` — Sección 2 (Auth & Security) y Sección 5 (API Routes). Conoce las 26 vulnerabilidades críticas que ya arreglamos.
3. `docs/history/AGENTS_V2.md` — Reglas de seguridad multi-tenant innegociables.
4. `ARCHITECTURE.md` (raíz) — Estado actual de sprints y routing.

**Si alguno de estos 4 archivos NO existe en el repo, PARA y pregunta. NO inventes.**

---

## SKILLS DE ANTIGRAVITY QUE DEBES USAR

Tienes 25 skills en `~/.gemini/antigravity/skills/`. Usa estas en este orden:

### Paso 0: `00_workspace_forensics`
Antes de hacer NADA, invoca la skill `00_workspace_forensics` para mapear el estado real del repo. Esta skill te dirá:
- Archivos duplicados
- Configuraciones reales
- Drift de schema
- Estado del working tree

**Su output es tu mapa. Sin él, estás trabajando a ciegas.**

### Paso 1: `18_pre_action_guard` (antes de cada cambio)
Antes de editar/crear/borrar CUALQUIER archivo, invoca `18_pre_action_guard`. Esta skill valida que la acción:
- No rompe R1 (build).
- No rompe R2 (consumers).
- No inventa rutas.

### Paso 2: `19_adversarial_reviewer` (después de cada cambio)
Después de CADA cambio (después de Edit/Write pero antes de commit), invoca `19_adversarial_reviewer`. Esta skill busca:
- Vulnerabilidades de seguridad.
- Drift de schema.
- Código muerto.
- Inconsistencias con el resto del repo.

### Paso 3: `07_deterministic_planner` (al inicio)
Antes de empezar a codear, invoca `07_deterministic_planner` con el plan de Sprint 5.1 (abajo). Esta skill te forzará a generar un plan determinístico paso a paso.

### Paso 4: `06_error_recovery` (si algo falla)
Si `npm run build` falla 2 veces seguidas por el mismo motivo, invoca `06_error_recovery`. NO inventes soluciones.

### Paso 5: `20_failure_postmortem` (al final, si algo salió mal)
Si tuviste que revertir o descartar trabajo, al final invoca `20_failure_postmortem` para documentar qué falló y por qué.

---

## EL PLAN — SPRINT 5.1 (léelo completo antes de empezar)

### Contexto del problema

El panel `/hq` (super-admin) tiene 3 problemas críticos de seguridad que debes arreglar:

1. **Validación de `super_admin` duplicada en 3 lugares:**
   - `src/app/hq/page.tsx:15-18` (query inline)
   - `src/app/hq/actions.ts:39-40` (en `deleteTenant`)
   - `src/app/hq/actions.ts:56-57` (en `updateTokenLimit`)
   
   Y peor: `src/lib/supabase/middleware.ts:59, 70` tiene el email **hardcodeado** (`cesargeo56@gmail.com`). ROTA. Bug latente. Dos fuentes de verdad paralelas.

2. **Acciones destructivas sin RPC:** `deleteTenant` y `updateTokenLimit` ejecutan SQL directo desde Server Actions con `createAdminClient()`. Sin idempotencia, sin audit log, sin soft-delete.

3. **Sin soft-delete:** Cuando "eliminas" un tenant, se borra de la DB. No hay forma de restaurar. No hay audit de quién borró qué.

### Archivos que vas a tocar (5 total)

| # | Path | Acción | Líneas estimadas |
|---|---|---|---|
| 1 | `src/lib/auth/super-admin.ts` | **CREAR** función `isSuperAdmin()` + `requireSuperAdmin()` | ~30 |
| 2 | `src/app/hq/actions.ts` | Reemplazar 2 validaciones duplicadas | -8 / +6 |
| 3 | `src/app/hq/page.tsx` | Usar `isSuperAdmin()` en vez de query inline | -3 / +3 |
| 4 | `src/lib/supabase/middleware.ts` | Migrar email hardcodeado a `isSuperAdmin()` | -3 / +5 |
| 5 | `supabase/migrations/20260713_hq_rpcs.sql` | **CREAR** SQL con 3 RPCs + columna `deleted_at` | ~80 |

**Total: 2 archivos nuevos, 3 modificados, ~125 líneas.**

### Implementación detallada (sigue esto AL PIE DE LA LETRA)

#### Archivo 1: `src/lib/auth/super-admin.ts` (NUEVO)

```ts
import { SupabaseClient } from '@supabase/supabase-js';

export interface SuperAdminCheckResult {
  isSuperAdmin: boolean;
  userId: string | null;
}

/**
 * Verifica si el usuario autenticado tiene role='super_admin' en profiles.
 * Única fuente de verdad. NUNCA hardcodear emails.
 */
export async function isSuperAdmin(
  supabase: SupabaseClient,
  userId: string | null
): Promise<boolean> {
  if (!userId) return false;
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle();
  if (error || !data) return false;
  return data.role === 'super_admin';
}

/**
 * Variante que retorna el user de la sesión. Usar en Server Actions.
 * Si falla la validación, lanza error explícito (NO return silencioso).
 */
export async function requireSuperAdmin(supabase: SupabaseClient): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('UNAUTHORIZED: No active session');
  if (!(await isSuperAdmin(supabase, user.id))) {
    throw new Error('FORBIDDEN: super_admin role required');
  }
  return user.id;
}
```

#### Archivo 2: `src/app/hq/actions.ts` (MODIFICAR)

Reemplaza las validaciones duplicadas en `deleteTenant` y `updateTokenLimit` por `requireSuperAdmin()`. Ejemplo para `deleteTenant`:

```ts
// ANTES (líneas 34-40):
const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();
if (!user) return;
const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
if (profile?.role !== 'super_admin') return;

// DESPUÉS:
const supabase = await createClient();
try {
  await requireSuperAdmin(supabase);
} catch (e) {
  console.error('[deleteTenant] Auth failed:', e);
  return;
}
```

Misma transformación para `updateTokenLimit`. NO toques `createTenant` (no requiere super_admin — es un endpoint público de onboarding, decídelo según el código actual).

**CAMBIO ADICIONAL en `deleteTenant`:** el action NO debe borrar el row directamente. Debe llamar a la RPC `suspend_tenant` (soft-delete). Lee la migración abajo.

**CAMBIO ADICIONAL en `updateTokenLimit`:** debe llamar a `update_tenant_token_limit` RPC en vez de UPDATE directo.

#### Archivo 3: `src/app/hq/page.tsx` (MODIFICAR)

Reemplaza la query inline de role por la función centralizada:

```ts
// ANTES (líneas 14-18):
const { data: { user } } = await supabase.auth.getUser();
if (!user) return <div>Acceso denegado...</div>;
const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
if (profile?.role !== 'super_admin' && process.env.NODE_ENV !== 'development') {
  return <div>No autorizado...</div>;
}

// DESPUÉS:
const { data: { user } } = await supabase.auth.getUser();
if (!user) return <div>Acceso denegado...</div>;
if (!(await isSuperAdmin(supabase, user.id)) && process.env.NODE_ENV !== 'development') {
  return <div>No autorizado...</div>;
}
```

Importar al inicio: `import { isSuperAdmin } from '@/lib/auth/super-admin';`

#### Archivo 4: `src/lib/supabase/middleware.ts` (MODIFICAR)

Busca las líneas 59 y 70 (o donde esté el `if (user.email !== 'cesargeo56@gmail.com')`). Reemplaza por:

```ts
// ANTES:
if (user.email !== 'cesargeo56@gmail.com') { ... }

// DESPUÉS:
const isAdmin = await isSuperAdmin(supabase, user.id);
if (!isAdmin) { ... }
```

Lee el archivo primero. La función `updateSession` recibe `req` y puede construir el supabase client. Si la firma actual no lo permite, NO migres este archivo (déjalo como deuda documentada en el commit body). Pero INTENTA migrarlo.

#### Archivo 5: `supabase/migrations/20260713_hq_rpcs.sql` (NUEVO)

```sql
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

-- 8. RLS en tenants: super_admin tiene acceso total
DROP POLICY IF EXISTS "tenants_super_admin_all" ON public.tenants;
CREATE POLICY "tenants_super_admin_all"
ON public.tenants
FOR ALL
TO authenticated
USING (public.is_super_admin())
WITH CHECK (public.is_super_admin());
```

**IMPORTANTE sobre la RLS `tenants_super_admin_all`:** Esta policy ROTA la lógica actual donde anon puede leer `tenants.is_active` y `subdomain` para el routing de landing. **NO la apliques todavía** si rompe la landing pública. Documéntalo en el commit body como "RLS migration pendiente, validar que anon aún puede hacer SELECT de subdomain + is_active antes de mergear". El commit del Sprint 5.1 puede incluir SOLO la creación de las RPCs + columna + audit_log + auth centralizada, y dejar la RLS para un commit separado.

**Decisión recomendada:** NO incluir la policy `tenants_super_admin_all` en este commit. Hacerla en Sprint 5.4 después de validar.

---

## REGLAS INQUEBRANTABLES (de GEMINI_PROTOCOL.md)

1. **R1 — BUILD = GATE ABSOLUTO.** NINGÚN commit sin `npm run build` Exit 0. DEBES mostrar las últimas 30 líneas del output.
2. **R2 — DELETE = VERIFICACIÓN.** Antes de borrar cualquier archivo, `grep -rln` para verificar consumers.
3. **R6 — Diffs visibles.** Antes de `git commit`, ejecuta `git diff --stat` y muéstralo.
4. **R7 — UN commit por sprint.** Mensaje conventional: `feat(sprint-5): centralize super admin auth and add destructive RPCs`.
5. **R8 — Documenta archivos huérfanos.** Si ves untracked, repórtalo.
6. **R9 — Walkthrough = Auditoría Real.** Al terminar, dame: `git show --stat` + output del build + justificación de cada archivo creado/modificado.
7. **R10 — Si te atascas, PARA y pregunta.** No inventes.

---

## ENTREGABLE FINAL (lo que necesito de ti al terminar)

```markdown
# Walkthrough Sprint 5.1

## Archivos modificados
[pégame `git show --stat HEAD`]

## Archivos nuevos
- src/lib/auth/super-admin.ts (N líneas)
- supabase/migrations/20260713_hq_rpcs.sql (N líneas)

## Build output (últimas 30 líneas)
[pega el output de `npm run build`]

## SQL aplicado
[marca: ✅ Aplicado en Supabase / ⏳ Pendiente de aplicar]

## Verificaciones
- [ ] R1: Build Exit 0 verificado
- [ ] R2: No se borró ningún archivo sin verificar consumers
- [ ] No se rompió la landing pública de tenants
- [ ] `createAdminClient()` solo en Server Actions de /hq (verificado con grep)
- [ ] No hay email hardcodeado de admin (verificado con grep "cesargeo56")

## Commit
[pega el hash y el mensaje del commit]

## Deuda conocida (si quedó algo)
[lista de cosas que NO pudiste hacer y por qué]
```

---

## CHECKLIST ANTES DE EMPEZAR

- [ ] Leí los 4 documentos obligatorios (GEMINI_PROTOCOL, AUDIT_REPORT, AGENTS_V2, ARCHITECTURE)
- [ ] Ejecuté `00_workspace_forensics` para mapear el estado real
- [ ] Verifiqué que `origin/main` está en `8af4a6b` o posterior
- [ ] Working tree limpio (`git status` debe decir "nothing to commit")
- [ ] Tengo claras las reglas R1-R10

**Si CUALQUIER checkbox falla, PARA y pregunta antes de codear.**
