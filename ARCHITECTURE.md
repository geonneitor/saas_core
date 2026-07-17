# 🏗️ Biblia del Proyecto — Arquitectura y Contexto Global (SaaS Core)

> **Última actualización:** 2026-07-16
> **Estado:** Sprints 0, 1, 2, 3.1, 3.2, 5.1, 5.2 y 5.3 Completados. Sprint 4 (WhatsApp) en curso (Fases 3 y 4 completadas).

---

## 1. 🎯 Misión y Visión
*   **Modelo de Negocio:** Infraestructura multi-tenant premium boutique para proveer instancias de agendas virtuales con IA a negocios locales (barberías, salones, clínicas).
*   **Eficiencia de Costos:** Arquitectura serverless/edge optimizada sobre la capa gratuita/barata de Vercel y Supabase.
*   **Upsell Estratégico:** Billetera prepago de tokens de IA para upselling natural de consumos recurrentes.

---

## 2. 🛠️ Stack Tecnológico
*   **Framework Core:** Next.js 16.2.10 (App Router, enrutado centralizado vía `src/proxy.ts` que reemplaza al middleware tradicional).
*   **Base de Datos & Auth:** Supabase (Postgres v17, RLS, PostgREST).
*   **Estilos y UI:** Tailwind CSS v4, Shadcn UI, Framer Motion, Lucide React (Estilo de diseño "Acid Brutalist Dark Mode" para HQ, "Dark Luxury" para tenant panels).
*   **Inteligencia Artificial:** Groq (`llama-3.3-70b-versatile` con tool calling para agendar/cancelar citas). Gemini para generación de embeddings.
*   **Pagos:** Stripe (Restricted Keys `rk_live_*` + webhook con validación de firmas e idempotencia vía base de datos).

---

## 3. 🏗️ Routing Multi-Tenant (Consolidado)

| Hostname | Rewrite Interno | Función |
|----------|-----------------|---------|
| `hq.${ROOT_DOMAIN}` | `/hq/*` | **HQ (Headquarters):** Único panel de super-admin del SaaS (métricas globales, creación, eliminación y edición de límites de tokens de todos los tenants). |
| `${ROOT_DOMAIN}` / `www.*` / `*.vercel.app` | `/` | **Landing principal:** Captación de prospectos y onboarding global. |
| `${tenant}.${ROOT_DOMAIN}` | `/[domain]/*` | **Espacio del Tenant:** Landing pública de reservas y su panel administrativo específico (`/[domain]/console`). Se usa un **Enrutador de Temas** (`page.tsx`) que renderiza layouts aislados desde `src/components/tenant-ui/themes/` para no afectar componentes globales. |

> 💡 **Nota de Consolidación:** La antigua ruta `app.${ROOT_DOMAIN}` que servía de "Command Center" fue completamente eliminada y sus componentes de creación/modificación de tenants fueron unificados dentro del panel `/hq` de super-admin para simplificar el mantenimiento y evitar confusión de subdominios.
> 💡 **Nota de Temas:** **NO modificar `page.tsx` con layouts de UI directamente**. Todo diseño o layout debe encapsularse en un archivo dentro de `src/components/tenant-ui/themes/` para mantener acoplamiento suelto.

---

## 4. 🗄️ Esquema y Aislamiento de Base de Datos
*   **Aislamiento:** Las tablas `appointments`, `customers` y `wallet_transactions` están blindadas mediante políticas RLS y filtradas estrictamente por `tenant_id`.
*   **Esquema de Tokens (Drift Resuelto):**
    *   La tabla `tenants` almacena directamente el límite de tokens (`ai_token_limit`) y los consumidos (`ai_tokens_used`). 
    *   Las columnas duplicadas `ai_tokens_limit` en `business_settings` y `tenants` fueron eliminadas de la base de datos real.
*   **Configuración del Inquilino:** La tabla `business_settings` almacena el prompt del asistente (`ai_prompt`), la llave Groq del tenant (`groq_api_key`), el tono de la IA (`ai_tone`), los servicios ofertados en JSON (`services_json`), reglas operativas (`ai_rules`) y geolocalización.

---

## 📅 Roadmap y Estado de Sprints

### ✅ Sprints 0, 1, 2 y 3.1-3.2 (Completados parcialmente)
*   **Sprint 0 (Seguridad & RLS):** Blindaje de políticas SELECT públicas de `tenants` y `business_settings`. Rotación de llaves Stripe, eliminación de Server Actions públicas vulnerables y aseguramiento de `/api/assistant`.
*   **Sprint 1 (Stripe & Idempotencia):** Bloqueo de inyecciones de precios en Stripe Checkout calculando montos en el servidor. Implementación de idempotencia en webhooks mediante tabla `stripe_events`.
*   **Sprint 2 (Consolidación de Arquitectura):** Remoción de las rutas `/admin` legacy de inquilinos y unificación de la consola de aprovisionamiento `/console` raíz dentro de `/hq` de super-admin. Reacomodo de scripts SQL en la carpeta `supabase/`.
*   **Sprint 3.1 — Rate Limiting:** Implementado in-memory token bucket en `/api/assistant` (15 req/min) y `/api/stripe/checkout` (5 req/min). Edge-compatible, migrable a Upstash Redis. Commit `a1e1540`.
*   **Sprint 3.2 — Caching & Revalidación:** `unstable_cache` con `revalidate: 60` y tag `'tenants'` en `src/app/[domain]/page.tsx` (landing pública del tenant). `export const revalidate = 60` en `src/app/[domain]/console/page.tsx` (dashboard del dueño). Commit `3949991`.

### ✅ Sprints 5.1, 5.2 y 5.3 (Completados — 2026-07-13)
> **Nota de orden:** estos sprints fueron ejecutados fuera de secuencia (después del Sprint 4 pendiente) para priorizar mejoras de auth y UI del panel HQ.

*   **Sprint 5.1 — Auth Centralizada + RPCs:** Centralización de validación `super_admin` en `src/lib/auth/super-admin.ts` (fuente única de verdad, eliminando email hardcodeado `cesargeo56`). Creación de 3 RPCs con `SECURITY DEFINER` + audit log: `suspend_tenant`, `update_tenant_token_limit`, `delete_tenant_permanently`. Columna `deleted_at` en `tenants` para soft-delete. Commit `d1b4b54`. SQL migration en `supabase/migrations/20260713_hq_rpcs.sql`.
*   **Sprint 5.2 — UI Acid Brutalist:** Sistema de diseño "Acid Brutalist Dark Mode" aplicado al panel `/hq`. Tokens CSS (`--acid-bg`, `--acid-neon`, etc.), tipografía Space Grotesk, componentes Shadcn `dialog` y `sonner` instalados. Rediseño de layout, métricas, tabla de tenants, y formularios. Commit `8b3ca0b`.
*   **Sprint 5.3 — Navegación Funcional + Auth Real:** Navegación pública funcional con links reales (`/login`, `/hq`, section anchors). Página de login con toggle signin/signup via Supabase Auth. Server Action de signOut. Secciones públicas de landing (#seguridad, #metricas). ContactForm con honeypot + Toaster. Commit `0916096`.

### 🟡 Sprint 3.3: Tipos Estrictos (Pendiente)
*   Eliminar el uso de `: any` o `as any` en los endpoints y vistas (14 en `assistant/route.ts`, 4 en `tools.ts`, 1 en `[domain]/page.tsx`, 1 en `useBookingStore.ts`).
*   Quitar `@ts-ignore` (7) y `@ts-expect-error` (2) usando tipos correctos.
*   Limpiar `console.log` en producción (17) envolviéndolos en `if (NODE_ENV !== 'production')`.
*   Quitar `isAdmin` del body del cliente en `AiAssistantChat.tsx:128`.

### 🔵 Sprint 4: Automatización WhatsApp y Motor de Temas (En Curso)
*   **Fase 3 (Backend & Cache):** Integración con API de Meta. Webhook procesa en segundo plano usando `after()` de Next.js para responder `< 200ms`. Se integró Upstash Redis como caché para límite de tokens (`src/lib/token-cache.ts`) y rate limit (`src/lib/rate-limit.ts`). Migración SQL `wa_inbox` generada.
*   **Fase 4 (Theme Engine):** Reescritura arquitectónica de la landing pública (`page.tsx`) como un Enrutador Dinámico de Temas. Nuevas plantillas (`CozyStudioTheme`, `DarkLuxuryTheme`) integradas de manera aislada.

### 🟡 Deuda Técnica de Sprint 2 (Pendiente)
*   `app.tu-dominio.com` hardcodeado en 6 lugares → helper `getAppUrl()` desde `NEXT_PUBLIC_ROOT_DOMAIN`.
*   `proxy.ts` sin allowlist de hostname → regex `^(?:[a-z0-9-]+\.)?(localhost|geo-dev\.online|vercel\.app)$`.
*   Cookie domain hardcodeado en `lib/supabase/server.ts:23-25`.
*   `useBookingStore` modal pendiente de implementar.

---

**Ver también en docs/history/:**
*   [AUDIT_REPORT.md](file:///c:/Users/USER%20END/Desktop/saas_core/docs/history/AUDIT_REPORT.md) (Auditoría de vulnerabilidades).
*   [SAAS_CORE_SYSTEM_REPORT.md](file:///c:/Users/USER%20END/Desktop/saas_core/docs/history/SAAS_CORE_SYSTEM_REPORT.md) (Historial v1.0).
*   [GEMINI_PROTOCOL.md](file:///c:/Users/USER%20END/Desktop/saas_core/docs/history/GEMINI_PROTOCOL.md) (Bases del protocolo).
*   `docs/history/PROMPT_GEMINI_SPRINT_5_1.md` — Prompt original Sprint 5.1 (archivo de contexto, no commiteado).
*   `docs/history/PROMPT_GEMINI_SPRINT_5_2.md` — Prompt original Sprint 5.2 (archivo de contexto, no commiteado).
*   `docs/history/PROMPT_ORQUESTADOR_SPRINT_5.md` — Prompt orquestador para verificación de sprints (archivo de contexto, no commiteado).
