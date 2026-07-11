# 🏗️ SaaS Core - Arquitectura y Contexto Global del Proyecto

> **🚨 AVISO CRÍTICO E IMPOSIBLE DE IGNORAR PARA CUALQUIER AGENTE (IA) PRESENTE O FUTURO 🚨**
> **LEER ESTO NO ES OPCIONAL.** Como agente trabajando en este repositorio, tienes la obligación absoluta de documentar cada cambio arquitectónico, decisión de producto, o alteración en los flujos de datos. Cada vez que completes un sprint, resuelvas un issue complejo o modifiques la estructura de la base de datos (Supabase) o la lógica multi-tenant, **DEBES** actualizar este documento y/o el sistema de documentación correspondiente. Si omites documentar, estás comprometiendo la viabilidad financiera del proyecto y rompiendo los protocolos de desarrollo. **Sin evidencia en runtime y sin documentación, tu trabajo no sirve. MANTÉN EL CONTEXTO VIVO Y DOCUMENTADO.**

---

## 1. 🎯 Objetivos del Proyecto y Visión
- **Idea Original:** Una plataforma SaaS multi-tenant diseñada para ofrecer herramientas de administración y un Asistente de IA integrado, permitiendo a los clientes (tenants) gestionar sus negocios, citas y configuraciones de manera automatizada.
- **Misión Financiera:** Generar revenue (flujo de caja) lo antes posible, manteniendo los costos operativos al mínimo absoluto (arquitectura serverless, capa gratuita prioritaria).
- **Motor de Growth Hacking (Demostración de ROI):** El sistema debe venderse solo. Los módulos adicionales (add-ons) deben incluir "comprobaciones de valor" proactivas (ej. la IA enviando reportes automáticos de aumento de citas, reducción de ausencias, o comparativas de crecimiento) para que el comerciante perciba la herramienta como un activo que multiplica su dinero, incentivando el upselling natural.
- **Estándar de Calidad:** UI/UX premium. Interfaces que transmitan prestigio (estilo Silicon Valley, animaciones sutiles, tipografías limpias como *Geist*). Cero componentes genéricos, todo debe sentirse de primer nivel.

## 2. 🛠️ Stack Tecnológico (Herramientas al Alcance)
- **Framework Core:** Next.js 16.2.10 (App Router) - *Atención: Existen breaking changes respecto a versiones previas (ej. `proxy.ts` reemplazando a `middleware.ts`). Consultar siempre documentación interna en `node_modules/next/dist/docs/`.*
- **Base de Datos & Auth:** Supabase (Postgres, RLS policies, SSR Auth).
- **Estilos y UI:** Tailwind CSS v4, Shadcn UI, Framer Motion (para micro-animaciones), Lucide React.
- **IA / LLM:** Integración backend con LLMs vía Groq para el asistente virtual (tool calling avanzado para agendar/cancelar citas de clientes).
- **Gestión de Estado y Utilidades:** Zustand, date-fns.

## 3. 🏗️ Arquitectura de Datos y Sistema Multi-Tenant
El sistema escala sirviendo a múltiples negocios bajo una sola infraestructura unificada, garantizando aislamiento de datos.
- **Entidades Clave:**
  - `tenants`: Negocios que usan el SaaS. Poseen un `owner_id` (vinculado a `auth.users`).
  - `business_settings`: Configuraciones exclusivas por tenant (ej. llaves de API, avatares y prompts del asistente).
  - `appointments` & `customers`: Datos operacionales estrictamente filtrados por `tenant_id`.
- **Seguridad y Permisos:** Aislamiento mandatorio. Todo endpoint, server action y policy (RLS) debe validar inequívocamente que el usuario autenticado tiene el rol (`owner` o `admin`) necesario para operar sobre un tenant específico. Prevenir siempre la escalada de privilegios cruzada.

## 4. 📋 Procedimientos y Protocolos de Desarrollo (LEAD ARCHITECT)
Como Co-Founder Técnico y Lead Architect, las siguientes reglas rigen toda interacción:
1. **Triangulación Pre-Ejecución:** Antes de escribir una sola línea de código, definir claramente *Dónde se hace el cambio*, *Si la función/entidad existe realmente*, y *Si este cambio nos acerca a la monetización (ROI)*.
2. **Evidencia Runtime Obligatoria (Zero Trust):** Ningún agente puede dar un issue por "completado" sin incluir pruebas reales de ejecución. Si es un endpoint, probar con `curl`. Si es DB, mostrar el output vía Supabase MCP. **NO TESTEADO = NO HECHO.**
3. **Mínima Fricción, Máximo Impacto:** Entregar código modular, preciso y listo para producción. Sin placeholders, sin charlas innecesarias. Escribir JSDoc/Docstrings de manera asíncrona.
4. **Protección Anti-Drift:** Cualquier propuesta que desvíe el enfoque de las metas financieras o de lanzamiento será rechazada y redirigida. Se debe cuestionar siempre: *"¿Es esta la forma más rápida y barata de entregar valor?"*

## 5. 📅 Estado Actual y Contexto (Sprint 2.5+)
- **Fase Actual:** Sprint 2.5 - Finalizando estabilización del Asistente IA (frontend/backend interop) y Admin Dashboard.
- **Hitos Recientes / Foco Inmediato (Base `fixes.md`):**
  - Seguridad en el guardado de settings (`actions.ts`).
  - Optimización de tool calling y falbacks en `/api/assistant`.
  - Refinamiento de la UX (Avatares flotantes, métricas claras).
  - Mantenimiento y modernización del framework (Deprecation de Middleware en Next 16).
  - **Fase 1 (Arquitectura Silicon Valley):** Renombramiento de rutas core a `/hq` (SuperAdmin) y `/console` (Command Center) para asegurar estándares B2B. Resolución de bloqueos Zero-Trust en Landing Pages mediante `createAdminClient` para lectura pública, y ajuste dinámico de cookies multi-dominio en `proxy.ts` y middleware.

## 6. 🧊 Icebox / Ideas a Futuro (Post-Monetización)
- **Voice-Command Control (Estilo Alexa):** Control del sistema mediante biometría/reconocimiento de voz para operar dashboards sin manos. *Nota del Arquitecto: Retenido estratégicamente hasta que el SaaS genere flujo de caja estable.*
