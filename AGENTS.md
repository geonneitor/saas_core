# 🛡️ Manual de Operaciones de Agentes (AGENTS.md)

> **Aplicación:** CADA respuesta y CADA sesión de agente IA en este repositorio. Sin excepciones.
> **Última actualización:** 2026-07-13

---

## 🚨 VERIFICADORES DE ESTADO (MANDATORIOS)

Para asegurar la continuidad del contexto de esta sesión, el agente debe cumplir estrictamente estas dos reglas de comunicación:

1. **Verificador de Presencia (Inicio de Respuesta):**
   *   El agente **DEBE iniciar cada respuesta** saludando o llamando al usuario exactamente como: **"Geo, estoy aquí contigo"**.
   *   *Si el agente inicia su turno sin esta frase exacta, es señal de que el contexto se ha saturado o perdido.*

2. **Verificador de Ambigüedad o Desvío (Fricción):**
   *   El agente **DEBE mencionar** exactamente la frase: **"Geo, no entiendo nada"** cuando las instrucciones del usuario o el estado del código sean poco claras, contradictorias, o se desvíen del objetivo principal del negocio.

---

## ⚠️ Regla 0 — Privilegio de Duda Cero
Cualquier afirmación del agente sobre el estado del proyecto debe estar respaldada por uno de:
*   `npm run build` Exit 0.
*   `git status` sin cambios no stageados inesperados.
*   Output literal de comandos de terminal (NO resúmenes interpretados).
*   Lectura directa del archivo que muestre la evidencia.

---

## 📋 Las 10 Reglas de Desarrollo

### R1. **BUILD = GATE ABSOLUTO**
*   NINGÚN commit sin verificar `npm run build` con Exit 0 en los últimos 5 minutos.
*   El agente DEBE mostrar las últimas 30 líneas del output del build en su respuesta.

### R2. **DELETE = VERIFICACIÓN DE CONSUMIDORES**
*   Antes de borrar cualquier archivo, busca todos los consumidores en `src/`:
    `grep -rln "NombreComponente" src/`
    Si hay 0 consumidores, se borra. Si hay $\ge 1$, se migran sus referencias primero.

### R3. **MOVE = ATOMIC + VERIFY**
*   Si reubicas un archivo:
    1. Crea el archivo en la nueva ubicación.
    2. Actualiza todos los imports.
    3. Borra el archivo viejo.
    4. Corre `npm run build`. Si Exit 0, commit. Si falla, NO commitear.

### R4. **NO inventes rutas ni archivos**
*   Las únicas rutas válidas de routing multi-tenant son las declaradas en `src/proxy.ts` (ver `ARCHITECTURE.md`).
*   No restaures la ruta `/admin` legacy (eliminada en Sprint 2).

### R5. **NO toques credenciales ni .env**
*   `STRIPE_SECRET_KEY`, `SUPABASE_*`, `.env.local` son intocables a menos que se solicite de forma explícita.
*   Nunca imprimas tokens ni keys en el chat.

### R6. **Diffs visibles antes de commit**
*   Antes de realizar `git commit`, el agente DEBE ejecutar y mostrar `git diff --stat`.

### R7. **UN commit por fase/sprint**
*   Sigue el formato de Conventional Commits: `<type>(<scope>): <description>`.
*   Body opcional explicando el POR QUÉ, no el qué.

### R8. **Documenta archivos huérfanos**
*   Cualquier archivo untracked no esperado (`git status`) debe ser reportado antes de tomar acción.

### R9. **Walkthrough = Auditoría Real**
*   Al entregar una tarea, el walkthrough debe incluir:
    *   Archivos modificados (`git show --stat`).
    *   Output final de `npm run build`.
    *   Justificación exacta de archivos creados o eliminados.

### R10. **Si te quedas atascado, PARA y pregunta**
*   Si un comando o build falla 2 veces seguidas por el mismo motivo, no inventes soluciones. Reporta el error completo y espera instrucciones de Geo.

---

## 🔒 Reglas Post-Auditoría de Seguridad (No Negociables)

### Seguridad Multi-Tenant
*   **NUNCA** uses `createAdminClient()` (service_role) en componentes cliente o páginas públicas. Solo se permite en: webhooks, acciones de super-admin (`/hq`), y Server Actions con validación explícita de ownership.
*   **SIEMPRE** valida `auth.getUser()` + `owner_id === user.id` en toda Server Action que modifique o lea datos específicos de un tenant.
*   **NUNCA** aceptes parámetros sensibles como `price`, `isAdmin`, `role`, o `tenantId` directamente del body del request del cliente sin validar contra la sesión o la base de datos en el servidor.

### Drift de Schema
*   La base de datos real utiliza `ai_token_limit` (límite de tokens, sin "s" al final de token) y `ai_tokens_used` (tokens consumidos) en la tabla `tenants`.
*   Antes de realizar cualquier inserción o actualización de columnas de tenant, lee `types/supabase-generated.ts` para confirmar el nombre exacto de la columna.
