# 🏗️ Biblia del Proyecto — Arquitectura y Contexto Global (SaaS Core)

> **Última actualización:** 2026-07-13
> **Estado:** Sprints 0, 1 y 2 Completados al 100%. Estructura de super-admin consolidada en `/hq`.

---

## 1. 🎯 Misión y Visión
*   **Modelo de Negocio:** Infraestructura multi-tenant premium boutique para proveer instancias de agendas virtuales con IA a negocios locales (barberías, salones, clínicas).
*   **Eficiencia de Costos:** Arquitectura serverless/edge optimizada sobre la capa gratuita/barata de Vercel y Supabase.
*   **Upsell Estratégico:** Billetera prepago de tokens de IA para upselling natural de consumos recurrentes.

---

## 2. 🛠️ Stack Tecnológico
*   **Framework Core:** Next.js 16.2.10 (App Router, enrutado centralizado vía `src/proxy.ts` que reemplaza al middleware tradicional).
*   **Base de Datos & Auth:** Supabase (Postgres v17, RLS, PostgREST).
*   **Estilos y UI:** Tailwind CSS v4, Shadcn UI, Framer Motion, Lucide React (Estilo de diseño "Dark Luxury").
*   **Inteligencia Artificial:** Groq (`llama-3.3-70b-versatile` con tool calling para agendar/cancelar citas). Gemini para generación de embeddings.
*   **Pagos:** Stripe (Restricted Keys `rk_live_*` + webhook con validación de firmas e idempotencia vía base de datos).

---

## 3. 🏗️ Routing Multi-Tenant (Consolidado)

| Hostname | Rewrite Interno | Función |
|----------|-----------------|---------|
| `hq.${ROOT_DOMAIN}` | `/hq/*` | **HQ (Headquarters):** Único panel de super-admin del SaaS (métricas globales, creación, eliminación y edición de límites de tokens de todos los tenants). |
| `${ROOT_DOMAIN}` / `www.*` / `*.vercel.app` | `/` | **Landing principal:** Captación de prospectos y onboarding global. |
| `${tenant}.${ROOT_DOMAIN}` | `/[domain]/*` | **Espacio del Tenant:** Landing pública de reservas y su panel administrativo específico (`/[domain]/console`). |

> 💡 **Nota de Consolidación:** La antigua ruta `app.${ROOT_DOMAIN}` que servía de "Command Center" fue completamente eliminada y sus componentes de creación/modificación de tenants fueron unificados dentro del panel `/hq` de super-admin para simplificar el mantenimiento y evitar confusión de subdominios.

---

## 4. 🗄️ Esquema y Aislamiento de Base de Datos
*   **Aislamiento:** Las tablas `appointments`, `customers` y `wallet_transactions` están blindadas mediante políticas RLS y filtradas estrictamente por `tenant_id`.
*   **Esquema de Tokens (Drift Resuelto):**
    *   La tabla `tenants` almacena directamente el límite de tokens (`ai_token_limit`) y los consumidos (`ai_tokens_used`). 
    *   Las columnas duplicadas `ai_tokens_limit` en `business_settings` y `tenants` fueron eliminadas de la base de datos real.
*   **Configuración del Inquilino:** La tabla `business_settings` almacena el prompt del asistente (`ai_prompt`), la llave Groq del tenant (`groq_api_key`), el tono de la IA (`ai_tone`), los servicios ofertados en JSON (`services_json`), reglas operativas (`ai_rules`) y geolocalización.

---

## 📅 Roadmap y Estado de Sprints

### ✅ Sprints 0, 1 y 2 (Completados)
*   **Sprint 0 (Seguridad & RLS):** Blindaje de políticas SELECT públicas de `tenants` y `business_settings`. Rotación de llaves Stripe, eliminación de Server Actions públicas vulnerables y aseguramiento de `/api/assistant`.
*   **Sprint 1 (Stripe & Idempotencia):** Bloqueo de inyecciones de precios en Stripe Checkout calculando montos en el servidor. Implementación de idempotencia en webhooks mediante tabla `stripe_events`.
*   **Sprint 2 (Consolidación de Arquitectura):** Remoción de las rutas `/admin` legacy de inquilinos y unificación de la consola de aprovisionamiento `/console` raíz dentro de `/hq` de super-admin. Reacomodo de scripts SQL en la carpeta `supabase/`.

### 🟡 Sprint 3: Optimización y Tipos (Pendiente)
*   **Caching & Revalidación:** Inyectar estrategias de revalidación en las landings dinámicas de los tenants.
*   **Tipado Estricto:** Eliminar el uso de `: any` o `as any` en los endpoints y vistas reemplazándolos con tipos autogenerados de Supabase.
*   **Rate Limiting:** Implementar limitación de peticiones por IP en `/api/assistant` y endpoints de Stripe Checkout para mitigar ataques de denegación de servicio.

### 🔵 Sprint 4: Automatización (Pendiente)
*   **WhatsApp API:** Integración con la API de WhatsApp de Meta para que la IA responda y gestione las reservas de los tenants por mensajería directa en tiempo real.

---

**Ver también en docs/history/:**
*   [AUDIT_REPORT.md](file:///c:/Users/USER%20END/Desktop/saas_core/docs/history/AUDIT_REPORT.md) (Auditoría de vulnerabilidades).
*   [SAAS_CORE_SYSTEM_REPORT.md](file:///c:/Users/USER%20END/Desktop/saas_core/docs/history/SAAS_CORE_SYSTEM_REPORT.md) (Historial v1.0).
*   [GEMINI_PROTOCOL.md](file:///c:/Users/USER%20END/Desktop/saas_core/docs/history/GEMINI_PROTOCOL.md) (Bases del protocolo).
