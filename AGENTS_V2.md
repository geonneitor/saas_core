# 🧠 AGENTS_V2.md — Reglas Actualizadas y Plan de Acción

> **Para:** Cualquier agente IA (Claude, Gemini, GPT) que trabaje en `saas_core` desde 2026-07-12 en adelante.
> **Reemplaza:** Ningún archivo (es ADITIVO a `AGENTS.md` y `ARCHITECTURE.md`).
> **Origen:** Resultado de la auditoría completa del 2026-07-12 (ver `AUDIT_REPORT.md`).

---

## 📌 Reglas Inquebrantables (lee antes de tocar código)

### R1. Aislamiento de Tenant es SAGRADO
- Toda Server Action que lea/escriba datos de un tenant DEBE:
  1. Llamar `createClient()` (NO `createAdminClient`).
  2. Validar `auth.getUser()` y `user.id === tenant.owner_id`.
  3. Si no se cumple, retornar error genérico (sin filtrar info).
- `createAdminClient()` (service_role) SOLO se permite en:
  - `/api/stripe/webhook` (necesita bypass de RLS para actualizar tokens tras pago).
  - `src/app/console/actions.ts` (CRUD de super-admin).
  - Cualquier Server Action que esté EXPLICITAMENTE marcada con comentario `// SUPER_ADMIN_ONLY`.
- **Cualquier uso de `createAdminClient` en `/[domain]/*` (público) es un BUG CRÍTICO.**

### R2. Schema Real vs Código
- La DB real verificada por PostgREST tiene:
  - `tenants.ai_token_limit` (integer, sin "s") ← EL CORRECTO
  - `tenants.ai_tokens_used` (integer)
  - `tenants.extra_modules` (LEGACY, no se usa)
  - `tenants.ai_tokens_limit` (LEGACY, duplicado con "s", no se usa)
- Antes de escribir columnas de tenant, **lee `types/supabase-generated.ts`**.
- Si ves `ai_tokens_limit` en código nuevo, es un BUG.

### R3. Build Antes de Commit
- `npm run build` debe pasar con Exit 0.
- Si rompes el build y lo commiteas, es una violación del protocolo de despliegue (ver `AGENTS.md`).
- 3 intentos para arreglar el build. Si no se puede, REPORTAR al usuario, no hacer commit.

### R4. No Inventes Rutas ni Endpoints
- Las rutas válidas son las que están en `proxy.ts:38-89`:
  - `hq.${ROOT_DOMAIN}` → `/hq/*`
  - `app.${ROOT_DOMAIN}` → `/console/*`
  - Raíz / `www.*` / `*.vercel.app` → `/`
  - Subdominios / custom domains → `/[domain]/*`
- NO crees nuevas rutas en `src/app/[domain]/admin/*` (legacy).

### R5. Credenciales Rotadas — NO uses las viejas
- `STRIPE_SECRET_KEY` actual: Restricted Key `rk_live_*` (NO uses `sk_live_*`).
- `STRIPE_WEBHOOK_SECRET` actual: `whsec_*` (rotado 2026-07-12).
- `SUPABASE_ACCESS_TOKEN` actual: `sbp_*` (ver `.env.local`).
- Si algún día el usuario dice "ya roté X", valida en `.env.local` antes de asumir.

---

## 🚀 Plan de Acción (en orden)

### Sprint 0 — URGENTE (1-2 días) — Fixes Críticos
> Objetivo: cerrar los 7 hallazgos 🔴 de mayor impacto.

#### Fix 0.1 — Drift de schema `ai_token_limit` (15 min)
**Síntoma:** Nuevos tenants creados con `ai_tokens_limit: 1000` (con "s") en vez de `ai_token_limit: 100000`.

**Pasos:**
1. Ejecutar `supabase_update.sql` actualizado en el SQL Editor de Supabase.
2. Verificar con:
   ```sql
   SELECT column_name FROM information_schema.columns
   WHERE table_name = 'tenants' AND column_name LIKE '%token%';
   ```
3. Cambiar `src/app/console/actions.ts:21`:
   - `ai_tokens_limit: 1000` → `ai_token_limit: 1000` (o mejor: 100000).
4. Commit: `fix(actions): correct ai_token_limit column name (no 's')`.

#### Fix 0.2 — RLS en `tenants` y `business_settings` (30 min)
**Síntoma:** anon puede leer `owner_id`, `stripe_customer_id`, `ai_prompt`, `groq_api_key` (cuando se setee), `referral_code`.

**SQL a aplicar:**
```sql
-- Solo permitir SELECT público de columnas seguras del tenant
DROP POLICY IF EXISTS "tenants_select_public" ON public.tenants;
CREATE POLICY "tenants_select_public" ON public.tenants
  FOR SELECT TO anon
  USING (is_active = true);
-- NOTA: anon aún puede SELECT, pero el código solo debe leer columnas públicas.
-- Si se necesita ocultar `referral_code`, usar vistas o policies por columna (no soportado nativo).

-- business_settings: solo super_admin o service_role
DROP POLICY IF EXISTS "business_settings_select_owner" ON public.business_settings;
CREATE POLICY "business_settings_select_owner" ON public.business_settings
  FOR SELECT TO authenticated
  USING (
    tenant_id IN (SELECT id FROM tenants WHERE owner_id = auth.uid())
  );
-- anon NO debe poder SELECT de business_settings en absoluto.
```

#### Fix 0.3 — `/api/assistant` auth (45 min)
**Síntoma:** Cualquiera puede llamar `/api/assistant` con `isAdmin: true` en el body.

**Pasos en `src/app/api/assistant/route.ts`:**
1. Añadir al inicio del handler:
   ```ts
   const supabase = await createClient();
   const { data: { user } } = await supabase.auth.getUser();
   if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
   ```
2. Eliminar `isAdmin` del destructuring del body.
3. Derivar de DB:
   ```ts
   const { data: tenant } = await supabase
     .from('tenants').select('owner_id, subdomain').eq('id', tenantId).single();
   if (!tenant || tenant.owner_id !== user.id) {
     return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
   }
   const isAdmin = true; // el owner siempre es admin de su tenant
   ```
4. Commit: `fix(api/assistant): derive isAdmin from session, remove from body`.

#### Fix 0.4 — `bookAppointment` ownership (30 min)
**Síntoma:** `src/app/[domain]/actions.ts:7-76` usa `createAdminClient()` y no valida owner.

**Pasos:**
1. Cambiar `import { createAdminClient }` por `import { createClient }` (de server).
2. Añadir validación de owner al inicio de la función.
3. Reemplazar `createAdminClient().from('tenants')...` por queries RLS-aware.
4. Commit: `fix(actions): enforce tenant ownership in bookAppointment`.

#### Fix 0.5 — Stripe webhook idempotencia (1 h)
**Síntoma:** Reintentos de Stripe duplican tokens.

**Pasos:**
1. Crear tabla `stripe_events` (id, type, payload, processed_at).
2. En el webhook, INSERT en `stripe_events` con `id` = `event.id` antes de procesar.
3. Si el INSERT falla por UNIQUE violation, retornar 200 (ya procesado).
4. Para UPDATE de tokens, usar RPC atómica:
   ```sql
   CREATE OR REPLACE FUNCTION increment_token_limit(p_tenant_id uuid, p_amount int)
   RETURNS void AS $$
     UPDATE tenants SET ai_token_limit = ai_token_limit + p_amount
     WHERE id = p_tenant_id;
   $$ LANGUAGE sql;
   ```
5. Commit: `fix(webhook): add idempotency table and atomic token update`.

#### Fix 0.6 — `/api/stripe/checkout` price injection (20 min)
**Síntoma:** Cliente puede enviar `price: 0.01` y comprar módulo de $149 por 1 centavo.

**Pasos en `src/app/api/stripe/checkout/route.ts`:**
1. Crear catálogo server-side:
   ```ts
   const CATALOG = {
     whatsapp: { title: 'WhatsApp Autopilot', price: 14900 }, // centavos
     pos: { title: 'Terminal de Caja (POS)', price: 9900 },
     analytics: { title: 'Reportes Avanzados', price: 4900 },
     tokens_10k: { title: 'Pack 10k Tokens', price: 1500 },
     tokens_50k: { title: 'Pack 50k Tokens', price: 4900 },
     tokens_200k: { title: 'Pack 200k Tokens', price: 14900 },
   };
   ```
2. Ignorar `price` y `title` del body. Usar `CATALOG[moduleId]`.
3. Si el módulo no existe, retornar 400.
4. Commit: `fix(checkout): use server-side price catalog, ignore client body`.

#### Fix 0.7 — `useSearchParams` Suspense (10 min)
**Síntoma:** `LiveTrialWizard.tsx:47` usa `useSearchParams()` sin `<Suspense>`, crashea SSR en Next 16.

**Pasos:**
1. En el padre que renderiza `LiveTrialWizard` (buscar con grep), envolverlo en `<Suspense fallback={null}>`.
2. O refactorizar `LiveTrialWizard` para extraer la parte que usa `useSearchParams` a un sub-componente, y envolver ese sub-componente en `<Suspense>`.
3. Commit: `fix(wizard): wrap useSearchParams consumer in Suspense boundary`.

### Sprint 1 — Estabilización (1 semana)
- Fix 0.8: Helper `getAppUrl()` para reemplazar `app.tu-dominio.com` (6 lugares).
- Fix 0.9: Refactor `createAdminClient` en páginas públicas (sustituir por RLS-aware reads).
- Eliminar `src/app/[domain]/admin/*` legacy (todo redirige a `/console`).
- Decidir `/console` vs `/hq` (consolidar o separar claramente).
- Tipos estrictos (eliminar `: any` en 12 archivos).
- Rate limiting en `/api/assistant` y `/api/stripe/checkout`.

### Sprint 2 — Performance y UX
- Refactor `LiveTrialWizard.tsx` para usar `next/image` (4 imágenes Unsplash).
- Añadir `export const revalidate = 60` en páginas dinámicas.
- Implementar `BookingModal` o eliminar `useBookingStore`.
- Envolver `console.log` en `if (NODE_ENV !== 'production')`.

### Sprint 3 — Icebox
- Voice-Command Control.
- Predictive analytics.
- i18n.

---

## 🛠️ Comandos Útiles (post-cambio)

```bash
# Validar build
npm run build

# Regenerar tipos de Supabase
npx supabase gen types typescript --project-id gmecnjouttietybyiyox > types/supabase-generated.ts

# Validar Stripe key
curl -u $STRIPE_SECRET_KEY: https://api.stripe.com/v1/balance

# Test webhook localmente
.tools/stripe.exe listen --forward-to localhost:3000/api/stripe/webhook
.tools/stripe.exe trigger checkout.session.completed

# Validar RLS con curl (PostgREST)
curl "$SUPABASE_URL/rest/v1/tenants?select=owner_id" -H "apikey: $SUPABASE_ANON_KEY" -H "Authorization: Bearer $SUPABASE_ANON_KEY"
# Esperado con RLS correcto: 0 filas o solo públicas.
```

---

## 📚 Documentos de Referencia

- **`AUDIT_REPORT.md`** — Auditoría completa (8 secciones, 26/29/16 hallazgos).
- **`ARCHITECTURE.md`** — Arquitectura y estado actual.
- **`AGENTS.md`** — Reglas operativas (incluye reglas post-auditoría).
- **`types/supabase-generated.ts`** — Schema real de DB.
- **`supabase_update.sql`** — Script de migración del Sprint 8 corregido.
- **`supabase_update_payments.sql`** — Script de migración del Sprint 9 (referidos y pagos).

---

## ⚠️ Si Encuentras Algo que Contradice Este Documento

1. Verifica el estado real en disco y en DB (PostgREST).
2. Si la contradicción es por código legacy, **NO actúes sobre el legacy** sin confirmar con el usuario.
3. Actualiza este documento + `ARCHITECTURE.md` + `AUDIT_REPORT.md` con la nueva realidad.
4. Documenta el cambio en el commit message.
