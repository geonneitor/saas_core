# 🏗️ SaaS Core — Arquitectura y Contexto Global del Proyecto

> **Última actualización:** 2026-07-12 (post-auditoría)
> **Auditor:** Claude Sonnet 4.5 (ver `AUDIT_REPORT.md`)
> **Estado:** Estabilización post-rotación de credenciales. Pendiente Sprint 0 (TOP 10 fixes críticos).

---

## 1. 🎯 Visión
- **Idea Original:** SaaS multi-tenant con Asistente IA integrado para gestión de citas, agenda, clientes y configuraciones de negocio.
- **Misión Financiera:** Revenue lo antes posible, costos operativos mínimos (arquitectura serverless, capa gratuita prioritaria).
- **Motor de Growth Hacking:** Módulos premium con "comprobaciones de valor" proactivas (reportes de aumento de citas, reducción de ausencias, comparativas de crecimiento) para upselling natural.
- **Estándar de Calidad:** UI/UX premium (estilo Silicon Valley), animaciones sutiles, tipografías limpias. Cero componentes genéricos.

## 2. 🛠️ Stack Tecnológico (vigente)
- **Framework Core:** Next.js 16.2.10 (App Router, usa `proxy.ts` en vez de `middleware.ts`).
- **DB & Auth:** Supabase (Postgres v17, RLS, PostgREST).
- **Estilos y UI:** Tailwind CSS v4, Shadcn UI, Framer Motion, Lucide React.
- **IA / LLM:** Groq (tool calling para agendar/cancelar citas). Gemini para generación de embeddings.
- **Pagos:** Stripe (Restricted Key `rk_live_*` + webhooks).
- **Gestión de Estado y Utilidades:** Zustand, date-fns.

## 3. 🏗️ Arquitectura Multi-Tenant (estado real)

### Entidades Clave
- `tenants`: Negocios. `owner_id` (FK a `auth.users`), `subdomain`, `active_modules`, `referral_code`.
- `business_settings`: Configuración por tenant (`ai_prompt`, `groq_api_key`, `theme`, `font`, `hero_image`).
- `appointments` y `customers`: Datos operacionales filtrados por `tenant_id`.
- `profiles`: Solo 2 columnas (`id`, `role`).
- `wallet_transactions`: Existe pero no se usa (candidato a borrar en Sprint 1).

### Modelo de Routing (estado REAL, no aspiracional)
| Hostname | Rewrite | Función |
|----------|---------|---------|
| `hq.${ROOT_DOMAIN}` | `/hq/*` | Panel super-admin (métricas globales) |
| `app.${ROOT_DOMAIN}` | `/console/*` | Centro de mando (CRUD tenants, token limits) |
| `${ROOT_DOMAIN}` / `www.*` / `*.vercel.app` | `/` | Landing principal |
| `${tenant}.${ROOT_DOMAIN}` | `/[domain]/*` | Tenant público (landing + admin) |
| Custom domain | `/[domain]/*?custom_domain=true` | Tenant con dominio propio |

> ⚠️ **DUPLICIDAD CONOCIDA:** `app.${ROOT_DOMAIN}` y `hq.${ROOT_DOMAIN}` reescriben a directorios diferentes con funciones solapadas. `src/app/console/actions.ts` contiene las Server Actions activas (createTenant, deleteTenant, updateTokenLimit). `src/app/hq/page.tsx` solo lee métricas. **Decisión pendiente:** consolidar en Sprint 1.

### Seguridad
- Aislamiento mandatorio. Validar `owner_id === auth.uid()` en toda Server Action.
- `service_role` (`createAdminClient`) **SOLO** en webhooks, super-admin y Server Actions privilegiadas. NUNCA en páginas públicas.
- RLS policies en `appointments`, `customers`, `wallet_transactions`: verificadas ✅.
- RLS policies en `tenants` y `business_settings`: **REVISIÓN PENDIENTE** (anon actualmente lee columnas sensibles — Top Fix #2).

## 4. 📋 Protocolos de Desarrollo

1. **Triangulación Pre-Ejecución:** ¿Dónde se hace? ¿La entidad existe? ¿Acercas al ROI?
2. **Evidencia Runtime Obligatoria (Zero Trust):** Endpoints probados con `curl`. DB con output real (PostgREST o Supabase CLI). **NO TESTEADO = NO HECHO.**
3. **Mínima Fricción, Máximo Impacto:** Modular, preciso, production-ready. JSDoc en funciones públicas.
4. **Protección Anti-Drift:** Cuestionar: *"¿Es la forma más rápida y barata de entregar valor?"*

## 5. 📅 Estado Actual (post-auditoría 2026-07-12)

### Completado
- ✅ Auditoría completa de 8 secciones (ver `AUDIT_REPORT.md`).
- ✅ Stripe rotado a Restricted Key (`saas_core_production`).
- ✅ Stripe webhook secret rotado.
- ✅ SUPABASE_ACCESS_TOKEN funcional.
- ✅ `STRIPE_SECRET_KEY` en `.env.local` validado contra API live.
- ✅ Schema DB real documentado (generado en `types/supabase-generated.ts`).
- ✅ `AUDIT_REPORT.md` en raíz con 26/29/16 hallazgos críticos/importantes/menores.
- ✅ Archivos muertos eliminados: `StyleSelector.tsx`, `TokenUsageBar.tsx`.

### Pendiente Inmediato (Sprint 0 — 1-2 días)
1. **🔴 Fix drift `ai_token_limit`** (Top #1): Ejecutar `supabase_update.sql` actualizado. Cambiar `ai_tokens_limit` → `ai_token_limit` en `src/app/console/actions.ts:21`.
2. **🔴 RLS en `tenants` y `business_settings`** (Top #2): Bloquear SELECT público de columnas sensibles.
3. **🔴 `/api/assistant` auth** (Top #3): Eliminar `isAdmin` del body. Derivar de sesión.
4. **🔴 `bookAppointment` ownership** (Top #4): Reemplazar `createAdminClient` por `createClient` + validar owner.
5. **🔴 Stripe webhook idempotencia** (Top #5): Crear tabla `stripe_events` + RPC atómica.
6. **🔴 `/api/stripe/checkout` price injection** (Top #6): Catálogo server-side.
7. **🔴 `useSearchParams` Suspense** (Top #7): Envolver `LiveTrialWizard.tsx` en `<Suspense>`.
8. **🔴 `app.tu-dominio.com` hardcodeado** (Top #9): Reemplazar por `getAppUrl()` helper.
9. **🟡 `extra_modules` cleanup** (DB): `ALTER TABLE ... DROP COLUMN`.
10. **🟡 Refactor `createAdminClient` en páginas públicas** (Top #8): Sustituir por RLS-aware reads.

### Sprint 1 (próxima semana)
- Consolidar `/console` vs `/hq` (decidir cuál sobrevive).
- Eliminar `src/app/[domain]/admin/*` legacy (redirige a `/console`).
- Implementar `BookingModal` o eliminar `useBookingStore`.
- Tipos estrictos (eliminar `: any`).
- Rate limiting en `/api/assistant` y `/api/stripe/checkout`.

## 6. 🧊 Icebox (post-monetización)
- Voice-Command Control (biometría/reconocimiento de voz).
- Predictive analytics con ML.
- Multi-idioma (i18n).

---

**Mantenimiento:** Este archivo debe actualizarse cuando:
- Se ejecuten los Sprints del `AUDIT_REPORT.md`.
- Se rote cualquier credencial.
- Se cambie el modelo de routing.
- Se añadan/eliminen entidades de DB.

**Ver también:** `AUDIT_REPORT.md`, `AGENTS.md` (reglas operativas), `AGENTS_V2.md` (plan de acción).
