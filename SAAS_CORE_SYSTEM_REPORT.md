# 🛸 SAAS CORE — REPORTE DE SISTEMA Y ANÁLISIS QUIRÚRGICO (V1.0)

> **FECHA DEL REPORTE:** 2026-07-04
> **AUTOR:** Lead Architect (AI) / Technical Co-Founder
> **ESTADO ACTUAL:** Sprint 4 (Integración Stripe y Facturación UI) - Backend Listo

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
- **Sprint 4 (Fase UI Stripe):** El agente UI (Minimax/Claude Code) está construyendo el Paywall y Dashboard de Facturación (`/admin/billing`). El Lead Architect ya programó los endpoints de Stripe (Webhooks, Checkout) y agregó la lógica de bloqueo de tokens en el cerebro de la IA. ✅ *Backend de pagos listo, en espera de la UI.*
- **Sprint 6 (Automatización):** Integración con API de WhatsApp para que la IA responda por canales directos.

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
