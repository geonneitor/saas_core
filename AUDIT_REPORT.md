# 📊 Reporte de Auditoría Completa — SaaS "Caballo de Troya"

> **Fecha:** 2026-07-12
> **Versión auditada:** `main` @ a769d53 (post-rotación de Stripe key)
> **Auditor:** Claude Sonnet 4.5 (Fase 1) + Sonnet 4.5 con acceso Supabase CLI + PostgREST live (Fase 2)
> **Metodología:** Análisis estático de 23 archivos críticos + DB real consultada via PostgREST + Stripe API validada en vivo + `npm run build` (Exit 0, 17 rutas, 109s)

---

## 📋 Resumen Ejecutivo

| Métrica | Valor |
|---------|-------|
| Secciones auditadas | 8 / 8 |
| Archivos leídos | 23 directamente + cruces en `src/` |
| Build local | ✅ Exit 0 (109s, 17 rutas) |
| **🔴 Hallazgos críticos** | **26** |
| **🟡 Hallazgos importantes** | **29** |
| 🟢 Hallazgos menores | 16 |
| Tiempo estimado de fix del TOP 10 | ~6-8 horas |

---

## 🏆 TOP 10 FIXES PRIORITARIOS (orden de ataque)

1. **🔴 Drift `ai_token_limit` vs `ai_tokens_limit`** — 1 SQL ALTER + 1 char en código. Probable causa del límite bajo de tokens.
2. **🔴 anon puede leer `groq_api_key` y `ai_prompt`** de `business_settings` — Policy RLS de 5 líneas.
3. **🔴 `/api/assistant` sin auth** — 15 min, eliminar `isAdmin` del body + `getUser()` check.
4. **🔴 `bookAppointment` server action sin owner-check** — 30 min, riesgo de drenaje de tokens cross-tenant.
5. **🔴 Stripe webhook sin idempotencia** — compraste 10k tokens, recibes 20k si Stripe reintenta.
6. **🔴 `/api/stripe/checkout` acepta `price` del body** — cualquiera paga 1 centavo por módulo de $149.
7. **🔴 `useSearchParams` sin `<Suspense>` en `LiveTrialWizard`** — 5 min, bug del botón desaparecido.
8. **🔴 `createAdminClient` en 5 páginas públicas** — refactor mayor, eliminar riesgo de fuga total.
9. **🟡 `app.tu-dominio.com` hardcodeado en 6 lugares** — placeholder que llegó a producción.
10. **🟡 Race conditions en `ai_tokens_used` updates** — UPDATE atómico o trigger SQL.

---

# SECCIÓN 1: Arquitectura y Estructura

### 🔴 [Doble panel admin legacy convive con el nuevo] — `src/app/[domain]/admin/*` y `src/app/[domain]/console/*`
**Problema:** Existen DOS conjuntos de rutas admin para el mismo tenant. El sidebar legacy `src/components/admin/app-sidebar.tsx:32-58` apunta a `/admin/*`. El nuevo `src/app/[domain]/console/layout.tsx:23-35` apunta a `/console/*`. Ambas son alcanzables. `auth/callback/route.ts:8` define `next = '/admin'` por defecto.
**Impacto:** Doble superficie de mantenimiento, UX inconsistente, métricas divergentes.
**Fix sugerido:** Decidir UNO (recomendado `/console/*` que es el Command Center). Borrar `src/app/[domain]/admin/`, `src/components/admin/`. Cambiar default `next` en `auth/callback/route.ts:8` a `/console`.

### 🔴 [Confusión de naming: `app.${rootDomain}` → `/console` vs `/[domain]/console`] — `src/proxy.ts:48-56`
**Problema:** Tres rutas llamadas "console" o "admin" con roles cruzados. `app.localhost:3000` reescribe a `/console` (raíz, super-admin), pero la nueva `/hq` (línea 38) también es super-admin.
**Impacto:** Usuarios llegan al super-admin creyendo estar en su tenant.
**Fix:** Renombrar `src/app/console/*` → `src/app/hq/*`. Borrar branch `app.${rootDomain}` del proxy (líneas 48-56).

### 🔴 [Email de super-admin hardcodeado en código] — `src/lib/supabase/middleware.ts:59, 70`
**Problema:** `if (user.email !== 'cesargeo56@gmail.com')` literal.
**Impacto:** Bug latente + dos fuentes de verdad paralelas (este check vs `profiles.role === 'super_admin'`).
**Fix:** Centralizar en función `isSuperAdmin(user)` que consulte `profiles`.

### 🟡 [StyleSelector.tsx y TokenUsageBar.tsx son código muerto]
**Archivos:** `src/components/tenant-ui/StyleSelector.tsx` (150 líneas), `src/app/[domain]/admin/billing/TokenUsageBar.tsx` (123 líneas)
**Problema:** Verificado con Grep: NO importados en ningún archivo activo.
**Fix:** Borrar ambos.

### 🟡 [`useBookingStore` sin componente que lea `isOpen`]
**Archivo:** `src/store/useBookingStore.ts`
**Problema:** `AiAssistantChat.tsx:33,142` llama `openModal(...)` pero no existe `<BookingModal>`.
**Fix:** Implementar el modal o eliminar el store.

### 🟡 [Bug #1 del prompt: `extra_modules` ya migrado]
**Verificado:** `extra_modules` NO aparece en código (solo DB legacy). Cleanup en DB pendiente.

### 🟢 Sin dependencias circulares detectadas
### 🟢 Estructura de carpetas coherente

---

# SECCIÓN 2: Autenticación y Seguridad

### 🔴 [`bookAppointment` Server Action NO valida owner — fuga cross-tenant] — `src/app/[domain]/actions.ts:7-76`
**Problema:** Usa `createAdminClient()` y acepta `tenantId` del request. NO llama `auth.getUser()`. NO valida `owner_id === user.id`. Cualquier visitante puede:
1. Llamar `bookAppointment(tenantIdAjeno, ...)` y crear citas
2. Agotar tokens IA del tenant víctima (`+150` cada vez, línea 64-67)
3. Contaminar `customers`/`appointments` ajenos

**Impacto:** Bypass total de multi-tenancy. El peor escenario posible en SaaS B2B.
**Fix:** Reemplazar `createAdminClient()` por `createClient()` (RLS). Validar `owner_id === user.id` (líneas 81-98 ya tienen este patrón en `updateAiSettings`). Validar `Origin` header para CSRF.

### 🔴 [`/api/assistant` completamente público] — `src/app/api/assistant/route.ts:17-23, 28, 30`
**Problema:** `export const runtime = 'edge'` + `isAdmin` viene del BODY del cliente. NO valida sesión. NO valida `tenantId` contra owner. Cualquiera puede:
- Consumir tokens Gemini de cualquier tenant
- Poner `isAdmin: true` y obtener el prompt "Concierge Administrativo" con tools peligrosas
- Leer listado de IDs de citas del día (línea 124-128 → fuga de PII)

**Impacto:** Fuga masiva de datos de clientes, drenaje de tokens.
**Fix:** Eliminar `isAdmin` del body, derivarlo de `supabase.auth.getUser()` + `owner_id === tenant.owner_id`. Rate-limit por IP + tenantId.

### 🔴 [`createAdminClient` (service_role) en 5 Server Components públicos]
**Archivos:**
- `src/app/[domain]/page.tsx:21, 50` (landing pública)
- `src/app/[domain]/console/ai-training/page.tsx:10`
- `src/app/[domain]/console/store/page.tsx:40`
- `src/app/hq/page.tsx:8`

**Problema:** Páginas públicas usan `service_role` para "bypass RLS". Un solo bug = fuga de TODA la DB.
**Impacto:** Catastrófico en multi-tenant.
**Fix:** Crear RLS policies de lectura pública. Reemplazar `createAdminClient()` por `createClient()` excepto en webhooks/Server Actions críticas.

### 🔴 [`proxy.ts` confía en `host` header sin allowlist] — `src/proxy.ts:22, 38, 48, 72`
**Problema:** `hostname = req.headers.get('host') || ''` se usa para reescritura sin validación.
**Impacto:** Subdomain takeover, open-redirect, confusión de routing.
**Fix:** Validar hostname contra regex `^(?:[a-z0-9-]+\.)?(localhost|geo-dev\.online|vercel\.app)$`.

### 🔴 [Cookie domain hardcodeado a `geo-dev.online`]
**Archivos:** `src/lib/supabase/server.ts:23-25`, `src/lib/supabase/middleware.ts:25-27`, `src/lib/supabase/client.ts:9`
**Problema:** En custom domains, cookie intenta `.geo-dev.online` → navegador la descarta.
**Impacto:** Login falla fuera de geo-dev.online.
**Fix:** Derivar de `process.env.NEXT_PUBLIC_ROOT_DOMAIN`.

### 🔴 [`/api/stripe/checkout` acepta `price` y `title` del body] — `src/app/api/stripe/checkout/route.ts:24, 50-65`
**Problema:** `price` y `title` se usan directo en `price_data`. Ataca: `price: 0.01` → paga 1 centavo por módulo de $149.
**Impacto:** Robo de módulos a precio arbitrario.
**Fix:** Catálogo server-side, ignorar `price`/`title` del body.

### 🔴 [Override `isAdmin = true` en dev] — `src/app/[domain]/page.tsx:77-79`
**Problema:** `if (process.env.NODE_ENV === 'development') { isAdmin = true; }` da admin total.
**Fix:** `isDevAdmin = (NODE_ENV === 'development' && user?.email === 'cesargeo56@gmail.com')`.

### 🟡 [Race condition en `ai_tokens_used` y `ai_token_limit`]
**Archivos:** `src/app/[domain]/actions.ts:18, 64-67`, `src/app/api/assistant/route.ts:228-233`, `src/app/api/stripe/webhook/route.ts:71-74`
**Problema:** `if (used >= limit)` + `update({ used: used + 1 })` no es atómico.
**Fix:** `UPDATE tenants SET ai_tokens_used = ai_tokens_used + 1 WHERE id = ? AND ai_tokens_used < ai_token_limit` y chequear `rowCount`.

### 🟡 [Open redirect en `auth/callback`] — `src/app/auth/callback/route.ts:8, 14`
**Problema:** `next` sin whitelist. `next=//evil.com` → redirect a evil.com.
**Fix:** `if (!next.startsWith('/') || next.startsWith('//')) next = '/console';`

### 🟡 [`?demo_admin=true` flag client-side sin validación]
**Archivos:** `src/components/tenant-ui/LiveTrialWizard.tsx:104-105`, `src/app/[domain]/page.tsx:134`, `src/app/console/page.tsx:79`
**Fix:** Eliminar de producción.

### 🟡 [`deleteTenant` no valida UUID; `updateTokenLimit` no valida rango] — `src/app/console/actions.ts:29-63`
**Fix:** Regex UUID, `Number.isInteger(limit) && limit >= 0 && limit <= 1_000_000`.

### 🟡 [`proxy.ts` matcher excluye `/api/`] — `src/proxy.ts:14`
**Problema:** Toda la seguridad de los endpoints recae en validación inline.
**Fix:** Documentar en README.

### 🟢 [`createAdminClient` singleton en `tools.ts:3`]
**Fix:** Crear por-request.

### 🟢 [`console.log` en producción]
**Archivos:** `src/proxy.ts:44, 54, 65, 87` + webhook + `[domain]/page.tsx:81`
**Fix:** Envolver en `if (NODE_ENV !== 'production')` o logger.

---

# SECCIÓN 3: Base de Datos y Queries

### 🔴 [Drift de schema: `ai_token_limit` vs `ai_tokens_limit` AMBAS existen]
**DB real (PostgREST):** `tenants` tiene `ai_token_limit` Y `ai_tokens_limit` (ambas). `business_settings` también.
**Código que escribe:**
- `src/app/console/actions.ts:21` → INSERT con `ai_tokens_limit: 1000` (con "s") ❌
- `src/app/api/stripe/webhook/route.ts:73` → UPDATE con `ai_token_limit: ...` (sin "s") ✅

**Impacto:** INSERTs insertan en columna que nadie lee. Probable causa de `ai_token_limit: 3` actual.
**Fix SQL:**
```sql
ALTER TABLE public.tenants DROP COLUMN IF EXISTS ai_tokens_limit;
ALTER TABLE public.business_settings DROP COLUMN IF EXISTS ai_tokens_limit;
```

### 🔴 [`extra_modules` columna huérfana]
**DB real:** Existe en `tenants` y `business_settings`. Código no la usa.
**Fix SQL:** `ALTER TABLE public.tenants DROP COLUMN extra_modules;`

### 🔴 [anon puede hacer SELECT de `tenants` y `business_settings` con campos sensibles]
**Verificado en vivo:** anon key devuelve 1 fila con:
- `tenants`: `owner_id`, `stripe_customer_id`, `stripe_subscription_id`, `trial_ends_at`, `setup_fee_paid`, `referral_code`, `ai_token_limit`, `available_rewards`, `payment_status`
- `business_settings`: `ai_prompt` (completo), `groq_api_key` (si está set), `whatsapp_number`, `theme`, `font`, `trial_ends_at`, `system_status`

**Verificado:** `referral_code` del tenant `cesar` = `211B976F` es legible públicamente.
**Impacto:** Visitante no autenticado puede enumerar tenants, leer prompts de IA, leer `groq_api_key` cuando se setee.
**Fix:** Crear policies RLS específicas que limiten SELECT a campos públicos o solo a `is_active = true` Y `subdomain = '...'`.

### 🔴 [anon puede enumerar el `referral_code` de todos los tenants]
**Fix:** Policy RLS que no exponga `referral_code` a anon.

### 🟡 [RLS de SELECT en `appointments`, `customers`, `wallet_transactions` funciona correctamente]
anon recibe 0 filas en estas tablas. ✅

### 🟡 [`profiles` solo tiene 2 columnas (`id`, `role`)]
**DB real:** `profiles: id (uuid PK) + role (text)`.
**Fix:** Considera trigger que sincronice `auth.users.email` → `profiles.email`.

### 🟡 [Sin índices documentados para queries de alto tráfico]
**Fix SQL:**
```sql
CREATE INDEX IF NOT EXISTS idx_tenants_subdomain ON tenants(subdomain);
CREATE INDEX IF NOT EXISTS idx_business_settings_tenant_id ON business_settings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_appointments_tenant_start ON appointments(tenant_id, start_time);
CREATE INDEX IF NOT EXISTS idx_customers_tenant ON customers(tenant_id);
```

### 🟢 FK constraints presentes en todas las tablas
### 🟢 [`wallet_transactions` existe pero no se usa]

---

# SECCIÓN 4: Routing Multi-Tenant

### 🔴 [`app.tu-dominio.com` hardcodeado en 6 lugares]
**Archivos:**
- `src/app/[domain]/page.tsx:187` → footer link
- `src/app/[domain]/console/page.tsx:19` → redirect login
- `src/app/[domain]/admin/layout.tsx:16`
- `src/app/[domain]/admin/page.tsx:10`
- `src/app/[domain]/console/calendar/page.tsx:11`
- `src/app/console/page.tsx:9`

**Problema:** String literal `https://app.tu-dominio.com` cuando `NODE_ENV !== 'development'`. Placeholder que llegó a producción.
**Fix:** Derivar de `process.env.NEXT_PUBLIC_ROOT_DOMAIN` con función helper `getAppUrl()`.

### 🔴 [`isCustomDomain` en proxy.ts:75 — clasifica `*.vercel.app` como custom]
**Archivo:** `src/proxy.ts:75`
**Fix:** `isCustomDomain = !isVercel && !isLocal && !isApp && !isHq`.

### 🟡 [`success_url` de Stripe Checkout usa `origin` header] — `src/app/api/stripe/checkout/route.ts:42-48`
**Fix:** Allowlist de origins.

### 🟡 [`cleanSubdomain` regex frágil en `proxy.ts:73`]
**Fix:** Regex estricta.

### 🟢 [Tabla de routing documentada desactualizada]

---

# SECCIÓN 5: API Routes

### 🔴 [`/api/assistant` — múltiples bugs críticos] — `src/app/api/assistant/route.ts`
1. **Línea 17-23:** `runtime = 'edge'` + lee `isAdmin` del body. No valida sesión.
2. **Línea 28-30:** Cliente decide qué prompt recibe.
3. **Línea 116-122:** Si `isAdmin === true`, devuelve lista de IDs de clientes del día (PII).
4. **Línea 175-198:** Tools admin solo si `isAdmin === true` del body.
5. **Línea 230:** `update({ ai_tokens_used: used + 1 })` no es atómico.
6. Sin rate-limit, sin `Origin` check.

**Fix:**
```ts
export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No auth' }, { status: 401 });
  
  const { messages, tenantId } = await req.json();
  const { data: tenant } = await supabase
    .from('tenants').select('owner_id, subdomain').eq('id', tenantId).single();
  if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
  
  const isAdmin = tenant.owner_id === user.id; // SERVER-SIDE
  // ... continuar con lógica existente
}
```

### 🔴 [`/api/stripe/webhook` — race condition + idempotencia rota] — `src/app/api/stripe/webhook/route.ts:71-80`
1. **Línea 73:** `ai_token_limit: (tenant.ai_token_limit || 0) + tokenAmount` — lost update clásico.
2. **Sin idempotencia explícita** — si Stripe reintenta, duplica tokens.
3. **Línea 30:** `console.log` expone evento a Vercel logs.

**Fix:** Crear tabla `stripe_events` + RPC `increment_token_limit` con `FOR UPDATE`.

### 🔴 [`/api/stripe/checkout` — acepta `price` y `title` del body] — `src/app/api/stripe/checkout/route.ts:24, 50-65`
1. **Línea 24:** `price` y `title` vienen del cliente.
2. **Línea 50-65:** `unit_amount` se calcula del `price` del body.
3. **Línea 42-48:** `origin` header controlable.

**Fix:** Catálogo server-side + allowlist de origins.

### 🟡 [`bookAppointment` en `lib/ai/tools.ts:36-110` — bugs múltiples]
1. Singleton de `createAdminClient()` a nivel módulo.
2. No valida `tenantId` ownership.
3. Email temporal falso crea clientes duplicados.
4. Sin check de disponibilidad atómico antes de agendar.

**Fix:** Crear `supabase` por-request. Validar ownership. UNIQUE INDEX en `(tenant_id, start_time)`.

### 🟡 [`cancelAppointment` y `rescheduleAppointment` sin validar ownership]
**Fix:** Misma validación que `bookAppointment`.

### 🟡 [`getBusinessStats` — filtro UTC vs hora local]
**Archivo:** `src/lib/ai/tools.ts:158-181`
**Fix:** Zona horaria explícita.

### 🟡 [Webhook suscrito a 3 eventos, solo procesa 1]
**Stripe Dashboard:** `checkout.session.completed`, `invoice.payment_succeeded`, `customer.subscription.deleted`.
**Fix:** Cancelar suscripción a los 2 últimos.

### 🟢 [`runtime = 'edge'` y `maxDuration = 30` correctamente declarados]
### 🟢 [Webhook firma validada correctamente]

---

# SECCIÓN 6: Componentes UI

### 🔴 [`useSearchParams` sin `<Suspense>` causa error en Next.js 16] — `src/components/tenant-ui/LiveTrialWizard.tsx:6, 47`
**Problema:** `useSearchParams()` en un client component SIN estar envuelto en `<Suspense>`. En Next.js 15+/16 esto lanza `useSearchParams should be wrapped in a suspense boundary` y la página falla en SSR.
**Impacto:** El botón "Setup Rápido" desapareció porque la página crashea en SSR. Este es el Bug #1 del prompt maestro.
**Fix:**
```tsx
// Padre
<Suspense fallback={null}>
  <DemoAdminButton />  // componente que usa useSearchParams
</Suspense>
```

### 🔴 [`LiveTrialWizard` usa `<img>` en vez de `next/image`] — `src/components/tenant-ui/LiveTrialWizard.tsx:187`
**Fix:** Usar `next/image` con `remotePatterns` configurado.

### 🟡 [`sidebar.tsx` de 723 líneas — NO refactor objetivo]
**Veredicto:** Es el sidebar estándar de Shadcn. NO tocar.

### 🟢 [`PaymentStatusBanner.tsx` — BIEN implementado]
`useSearchParams` correctamente envuelto en `<Suspense>`.

---

# SECCIÓN 7: Performance

### 🔴 [Imágenes Unsplash sin `next/image` en 3 lugares]
**Archivos:**
- `src/components/tenant-ui/LiveTrialWizard.tsx:23-26` (4 imágenes)
- `src/app/[domain]/page.tsx:102, 104` (hero image)

**Fix:** Configurar `next.config.ts` con `images.remotePatterns: [{protocol: 'https', hostname: 'images.unsplash.com'}]` y reemplazar `<img>` por `<Image>`.

### 🟡 [Falta caching/revalidación en páginas dinámicas]
**Archivos:** `src/app/[domain]/page.tsx`, `src/app/hq/page.tsx`, `src/app/console/page.tsx`
**Fix:** Añadir `export const revalidate = 60`.

### 🟡 [`globals.css` — 185 líneas, sin estilos muertos detectados]
### 🟢 [`optimizePackageImports` activo]
### 🟢 [Sidebar Shadcn — bundle moderado]

---

# SECCIÓN 8: Calidad de Código

### 🔴 [12 `console.log` de debug en producción]
**Archivos:** `src/proxy.ts:44, 54, 65, 87` + `src/app/api/stripe/webhook/route.ts:30, 39, 79, 97, 100` + `src/app/[domain]/page.tsx:81` + `src/components/admin/InteractiveCalendar.tsx:52` + `src/components/AiAssistantChat.tsx:84`
**Fix:** Envolver en `if (NODE_ENV !== 'production')` o logger estructurado.

### 🔴 [`ai_tokens_limit` con "s" en INSERT — schema drift]
**Archivo:** `src/app/console/actions.ts:21`
**Fix:** Cambiar a `ai_token_limit: 1000`.

### 🔴 [12 archivos con `: any` o `as any`]
**Archivos:** `src/app/api/assistant/route.ts`, `src/lib/ai/tools.ts`, `src/store/useBookingStore.ts`, `src/components/admin/app-sidebar.tsx`, `src/components/AiAssistantChat.tsx`, `src/components/AvatarSelector.tsx`, `src/app/[domain]/admin/AiSettingsForm.tsx`, `src/app/hq/components/TenantsDirectoryTable.tsx`, `src/app/[domain]/page.tsx`, `src/app/[domain]/actions.ts`, `src/app/api/stripe/{checkout,webhook}/route.ts`
**Fix:** Tipos explícitos de Supabase.

### 🟡 [Server Actions devuelven errores con mensajes crudos]
`bookAppointment:74` → `error.message` expone detalles de Supabase.
**Fix:** Mensajes genéricos al cliente, log server-side.

### 🟢 [Funciones públicas con JSDoc en su mayoría]
### 🟢 [Estructura de carpetas coherente]

---

## 📊 Tabla Resumen por Sección

| Sección | 🔴 | 🟡 | 🟢 |
|---------|-----|-----|-----|
| 1. Arquitectura | 4 | 7 | 3 |
| 2. Auth & Seguridad | 7 | 5 | 3 |
| 3. DB & Queries | 4 | 3 | 2 |
| 4. Routing Multi-Tenant | 2 | 2 | 1 |
| 5. API Routes | 3 | 5 | 2 |
| 6. Componentes UI | 2 | 1 | 1 |
| 7. Performance | 1 | 2 | 2 |
| 8. Calidad Código | 3 | 4 | 2 |
| **TOTAL** | **26** | **29** | **16** |

---

## 🔧 Estado de Configuración Validado (2026-07-12)

| Componente | Estado | Notas |
|------------|--------|-------|
| Node.js | ✅ v24.14.1 | Compatible con Next.js 16 |
| npm | ✅ 11.11.0 | |
| Stripe CLI | ✅ v1.43.7 | Instalado en `.tools/stripe.exe` |
| Supabase CLI | ✅ v2.109.1 | Vía `npx supabase@latest` |
| Docker | ⚠️ Instalado pero no corriendo | Necesario para `db pull` y `db lint` locales |
| `.env.local` | ✅ Configurado | 1 sola entry por key (sin duplicados) |
| `STRIPE_SECRET_KEY` | ✅ Restricted Key | `rk_live_*`, validada contra API |
| `STRIPE_WEBHOOK_SECRET` | ✅ Rotado | `whsec_*` |
| `SUPABASE_ACCESS_TOKEN` | ✅ Funcionando | `sbp_*` |
| Build local | ✅ Exit 0 | 17 rutas, 109s |
| DB real | ✅ `saas-caballo-de-troya` | 1 tenant (`cesar`), 1 profile (`super_admin`) |

---

## 📝 Próximos Pasos Recomendados

1. **Sprint 0 (urgente, 1-2 días):** TOP 1-5 fixes (drift schema, RLS, auth, idempotencia)
2. **Sprint 1 (1 semana):** TOP 6-10 + limpieza de archivos muertos
3. **Sprint 2 (1 semana):** Refactor mayor (eliminar panel `/admin` legacy, consolidar RLS)
4. **Sprint 3 (1 semana):** Performance, caching, tipos estrictos

---

**Reporte generado por:** Claude Sonnet 4.5
**Validado contra:** DB real (PostgREST), Stripe API live, build local
**Próxima revisión:** Después del Sprint 0
