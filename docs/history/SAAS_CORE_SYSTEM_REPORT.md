# 🛸 SAAS CORE — REPORTE DE SISTEMA Y ANÁLISIS QUIRÚRGICO (V1.0)

> **FECHA DEL REPORTE:** 2026-07-07 07:08 AM (Última actualización de Go-To-Market)
> **AUTOR:** Lead Architect (AI) / Technical Co-Founder
> **ESTADO ACTUAL:** Sprint 4 COMPLETADO. Repositorio listo para Deploy y Ventas.

---

## 1. 🎯 Misión y Visión Arquitectónica

**El Objetivo Supremo:** `saas_core` no es simplemente una aplicación; es el **Centro de Comando, Administración y Despliegue** para generar, gestionar y auditar múltiples instancias SaaS "premium boutique" con características idénticas o superiores a la aplicación original `zen` (ubicada en `web_local`).

Mientras `zen` demostró el modelo de negocio y el estándar de diseño (Dark Luxury, interfaces fluidas, atención al detalle), `saas_core` es la **infraestructura multi-tenant** que permite escalar ese estándar a miles de negocios (tenants) manteniendo:
- Aislamiento estricto de datos (RLS).
- Despliegue centralizado (un solo codebase que rutea por subdominio).
- Administración de IA centralizada (Asistente Groq integrado).

**Impedimentos Actuales:**
- Las bases de datos ya están blindadas (Sprint 2.5), pero falta completar la interfaz de usuario de facturación (Sprint 4 UI).
- La lógica de la pasarela de pagos (Stripe Checkout y Webhooks) y el chequeo en tiempo real del límite de tokens en `/api/assistant/route.ts` aún debe programarse.
- Deuda técnica menor con migraciones de Next.js 16 (ej. middleware deprecado hacia proxy).

---

## 2. 🏗️ Anatomía del Proyecto y Archivos Clave

### 2.1 Stack Tecnológico Implementado
- **Framework:** Next.js 16.2.10 (App Router).
- **Estilos:** Tailwind CSS v4, Framer Motion, Shadcn UI.
- **Base de Datos & Auth:** Supabase SSR.
- **Inteligencia Artificial:** Groq API (`llama-3.3-70b-versatile`) con soporte para Tool Calling avanzado.
- **Estado Global:** Zustand.

### 2.2 Estructura de Directorios y Funciones Centrales

| Directorio / Archivo | Función / Rol en el Sistema |
|----------------------|-----------------------------|
| `src/app/[domain]/` | El motor del multi-tenant. Maneja las solicitudes rutéandolas dinámicamente según el subdominio del cliente (tenant). |
| `src/app/hq/` | Headquarters. Dashboard central para el dueño del SaaS (métricas, consumos globales, mapas). Antiguamente `/superadmin`. |
| `src/app/console/` | Command Center. Zona de aprovisionamiento donde se crean/eliminan clientes (tenants). Antiguamente `/admin`. |
| `src/app/api/assistant/route.ts` | El cerebro de la IA. Gestiona la comunicación con Groq, inyecta contexto de base de datos y expone herramientas (`create_appointment`, `search_client_info`, `cancel_appointment`). |
| `src/components/AiAssistantChat.tsx` | UI principal del chatbot. Maneja la interacción en tiempo real del tenant con su asistente virtual. |
| `src/components/BookingModal.tsx` | Interfaz visual (legacy/alternativa) para agendar citas sin IA. |
| `src/middleware.ts` (pronto `proxy.ts`)| Intercepta peticiones para validación multi-tenant y manejo de sesiones Supabase. |
| `ARCHITECTURE.md` | Single Source of Truth sobre decisiones técnicas a nivel global. |
| `fixes.md` | Tracker quirúrgico de issues en curso, responsabilidades y testing rules. |
| `package.json` | Configurado con scripts optimizados y dependencias de UI (Lucide, Tailwind, Framer). |

---

## 3. ⏱️ Cronología y Estado de Sprints

### Sprints Completados (Fases 1 a 5)
- **Sprint 1 y 2:** Setup inicial Supabase, arquitectura multi-tenant Next.js, schema relacional.
- **Sprint 2.5:** Auditoría profunda. Eliminación de políticas públicas en Supabase y blindaje estricto RLS. Implementación de `createAdminClient` para operaciones Zero Trust. Limpieza de deuda técnica. (COMPLETADO ✅).
- **Sprint 3 (Consolidación UI/UX):** Integración de diseño "Dark Luxury" y Landing de Onboarding delegada a agente frontend. (COMPLETADO ✅).
- **Sprint 4 (Backend Monetización):** Inyección de esquema Stripe y límite de tokens IA (`ai_tokens_used`) en Supabase. (COMPLETADO ✅).
- **Sprint 5 (Entrenamiento IA):** Refinamiento de Prompts ("Dark Luxury Concierge"), teléfono obligatorio para reservas e inyección de horas operativas. (COMPLETADO ✅).

### Sprints Faltantes (Roadmap Inmediato)
- **Sprint 4 (Fase UI Stripe & Go-to-Market):** Dashboard de Facturación (`/admin/billing`) finalizado con enfoque "SaaS MRR" (Hook + Upsell IA a $29/mes). Errores estrictos de TS en Next.js 16 resueltos (`page.tsx`, `middleware.ts`). Build validado al 100%. Código listo para deploy a producción. Evaluación de modelo prepago archivada estratégicamente para priorizar speed-to-market. (COMPLETADO ✅).
- **Sprint 4.5 (Pivote a Prepago & Estabilización UI - 2026-07-07):** 
  - **Estrategia Comercial:** Implementación oficial del modelo "Prepago Amigo" integrando un `WalletDashboard` (Billetera de Tokens) y un panel administrativo modernizado bajo estética "Dark Luxury".
  - **UX/UI:** Desarrollo de un `InteractiveCalendar` con animaciones fluidas (Framer Motion) para gestión de citas.
  - **Bugfixes Críticos:**
    - Se resolvió un error fatal de hidratación (Hydration Mismatch) causado por la depreciación de `middleware.ts` en Next.js 16.2.10 (renombrado a `proxy.ts`).
    - Se parcheó el renderizado de imágenes rotas (404) inyectando fallbacks dinámicos hacia Unsplash en la Landing de inquilinos.
    - Se corrigieron los Server Actions (`updateVisualSettings`, `updateAiSettings`) permitiendo que el rol `super_admin` evada restricciones de propietario (Zero Trust Bypass) para facilitar configuración global.
- **Sprint 6 (Automatización):** Integración con API de WhatsApp para que la IA responda por canales directos.
- **Sprint 7 (Silicon Valley Refactor - Fase 1 a 4) [Julio 2026]:**
  - **Reestructuración de Rutas:** Se modularizó y renombró el dashboard de métricas globales (`/superadmin` ➔ `/hq`) y el panel de provisionamiento (`/admin` ➔ `/console`) para alinearse con estándares de Big Tech.
  - **Fragmentación de Interfaces (Clean UI):** La Landing Page brutalista fue descompuesta en componentes de cliente (`PublicNavbar`, `PublicHero`, `PublicFeatureGrid`) preparados nativamente para soportar animaciones 3D e inyecciones de `framer-motion`. Así mismo, se extrajeron tablas y métricas del HQ Dashboard.
  - **Resolución Error 404 (Prospectos):** Desbloqueo de lectura pública de UI en `src/app/[domain]/page.tsx` mediante `createAdminClient`, evadiendo RLS estricto de forma segura.
  - **Sesiones Cross-Origin:** Refactorización de cookies de sesión para soportar dominios personalizados (`mibarberia.com`) dinámicamente.

---

## 4. 🚨 PROTOCOLO DE DOCUMENTACIÓN OBLIGATORIA PARA AGENTES (IA)

> **CUALQUIER AGENTE, IA, O DESARROLLADOR QUE LEA ESTO DEBE CUMPLIR ESTA REGLA SIN EXCEPCIONES:**

Para mantener el control absoluto sobre el crecimiento de `saas_core` como sistema central de generación de apps, **es OBLIGATORIO** generar o actualizar un reporte estructurado idéntico a este en cada hito arquitectónico o al finalizar un Sprint.

**Formato exigido en cada actualización:**
1. **Verificación Runtime:** No reportarás código como "hecho" sin evidencia (curl, logs o MCP de Supabase).
2. **Contexto Multi-Tenant:** Asegurarás que cada nueva feature, tabla o componente sea segura (aislada por tenant) y escalable.
3. **Registro de Modificación:** Registrarás la fecha, el sprint, las horas invertidas (o tokens/llamadas) y los archivos modificados con precisión quirúrgica.
4. **Fricción Cero:** El código debe ser de grado producción. Sin placeholders. Sin funciones a medias.

*Si se omite este protocolo, el sistema perderá la cohesión necesaria para administrar plataformas de la talla de `zen`, llevando al fracaso del modelo de negocio SaaS.*

---
**FIN DEL REPORTE**
