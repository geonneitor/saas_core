# 🎼 PROMPT ORQUESTADOR — Verificar e Integrar Sprints 5.1 y 5.2 (Gemini)

> **Modo de uso:** Copia TODO este archivo y pégalo como primer mensaje cuando vuelvas a este chat (Claude Code) DESPUÉS de que Gemini haya terminado los Sprints 5.1 y 5.2. Este prompt restaura el contexto completo sin saturar la ventana.
>
> **Contexto previo necesario:** Estás trabajando en `C:\Users\USER END\Desktop\saas_core`. Último commit conocido antes de Gemini: `8af4a6b` (docs sprint roadmap).

---

## ROL

Soy el **orquestador técnico** del SaaS Multi-Tenant `saas_core`. Gemini ejecutó Sprints 5.1 (auth + RPCs) y 5.2 (UI Acid Brutalist) en chats separados. Mi trabajo ahora es:

1. **Verificar** que cada commit cumple R1 (BUILD = Exit 0) y las otras reglas.
2. **Decidir** qué commits aceptar, cuáles revisar, cuáles revertir.
3. **Aplicar el SQL** de las migraciones (Gemini NO lo puede hacer — necesita Supabase).
4. **Documentar** el estado final.
5. **Push** solo cuando el usuario lo autorice explícitamente.

---

## ESTADO ESPERADO ANTES DE EMPEZAR

Después de Gemini, el repo debe tener:

### Commit 1 (Sprint 5.1): Backend auth + RPCs
- Mensaje esperado: `feat(sprint-5): centralize super admin auth and add destructive RPCs`
- Archivos esperados:
  - **NUEVO**: `src/lib/auth/super-admin.ts` (~30 líneas, exporta `isSuperAdmin` + `requireSuperAdmin`)
  - **NUEVO**: `supabase/migrations/20260713_hq_rpcs.sql` (con 3 RPCs + audit_log + columna deleted_at)
  - **MODIFICADO**: `src/app/hq/actions.ts` (usa `requireSuperAdmin()`, llama a RPCs en vez de `createAdminClient()` directo)
  - **MODIFICADO**: `src/app/hq/page.tsx` (usa `isSuperAdmin()` en vez de query inline)
  - **MODIFICADO**: `src/lib/supabase/middleware.ts` (email hardcodeado reemplazado por `isSuperAdmin()` — o documentado como deuda)

### Commit 2 (Sprint 5.2): UI Acid Brutalist
- Mensaje esperado: `feat(sprint-5): apply acid brutalist design to hq dashboard`
- Archivos esperados (todos modificados, 0 nuevos):
  - `src/app/globals.css` (tokens `--acid-*` agregados)
  - `src/app/layout.tsx` (`Space_Grotesk` importado, `--font-grotesk` expuesto)
  - `src/app/hq/layout.tsx` (rediseño completo con tokens)
  - `src/app/hq/components/GlobalMetricsCards.tsx` (rediseño)
  - `src/app/hq/components/TenantsDirectoryTable.tsx` (rediseño)
  - `src/app/hq/components/CreateTenantForm.tsx` (rediseño)
  - `src/app/hq/components/UpdateTokenLimitForm.tsx` (rediseño)
  - `src/app/hq/components/DeleteTenantForm.tsx` (rediseño con Dialog de Shadcn)
- Componentes Shadcn instalados: `dialog`, `sonner`

---

## CHECKLIST DE VERIFICACIÓN (ejecutar en este orden)

### Verificación 0: Estado del repo

```bash
cd C:\Users\USER END\Desktop\saas_core
git status
git log --oneline -5
```

Espero ver: `working tree clean` y los 2 commits de Gemini al final del log.

**Si working tree NO está limpio, Gemini dejó trabajo sin commitear. STOP. Revisa `git status` y decide si commitear, stashear o descartar.**

### Verificación 1: R1 — Build Exit 0

```bash
npm run build
```

**ABSOLUTE GATE.** Si el build falla, NO avanzamos. Revisa el error:
- Si es TypeScript, lee el error y decide fix.
- Si es por imports rotos de Gemini, contacta al usuario.
- Si es por `createAdminClient()` mal migrado, lee la sección "Rollback plan" abajo.

**Guarda las últimas 30 líneas del output para documentar.**

### Verificación 2: R6 — Diffs visibles

```bash
git show --stat HEAD
git show --stat HEAD~1
```

Verifica que los archivos modificados/creados son los esperados (ver "Estado esperado" arriba).

### Verificación 3: R0 — No hay credenciales filtradas

```bash
git diff HEAD~2 HEAD
```

**Busca manualmente:**
- `cesargeo56@gmail.com` (NO debe quedar hardcodeado en `middleware.ts` ni en ningún archivo)
- Service role keys (NO deben aparecer en ningún diff)
- Tokens de API

Si encuentras CUALQUIER credencial expuesta, ROLLBACK inmediato del commit (ver "Rollback plan").

### Verificación 4: R2 — `createAdminClient()` solo en lugares permitidos

```bash
grep -rln "createAdminClient" src/
```

Lugares permitidos:
- `src/app/hq/actions.ts` (Server Actions críticas)
- `src/app/api/stripe/webhook/route.ts` (webhook de Stripe)
- `src/lib/supabase/admin.ts` (la definición)

**Cualquier otro uso es violación de seguridad.**

### Verificación 5: No hay email hardcodeado de admin

```bash
grep -rln "cesargeo56" src/
```

Debe retornar 0 archivos. Si retorna alguno (excepto que sea un comentario en `docs/`), es bug.

### Verificación 6: Tokens Acid Brutalist presentes

```bash
grep -E "acid-bg|acid-card|acid-neon" src/app/globals.css
```

Debe encontrar `--acid-bg: #050505` (o similar) y los demás tokens.

### Verificación 7: Space Grotesk importado

```bash
grep -E "Space_Grotesk|font-grotesk" src/app/layout.tsx
```

Debe encontrar la importación y el `variable: '--font-grotesk'`.

### Verificación 8: Dialog instalado (no más `window.confirm`)

```bash
grep -rn "window.confirm" src/app/hq/
```

Debe retornar 0 archivos. Si hay, es deuda de Gemini.

### Verificación 9: RPCs definidas en migración

```bash
grep -E "suspend_tenant|update_tenant_token_limit|delete_tenant_permanently|is_super_admin" supabase/migrations/20260713_hq_rpcs.sql
```

Debe encontrar las 4 funciones (1 helper + 3 RPCs).

---

## APLICAR SQL EN SUPABASE (CRÍTICO)

Gemini NO puede aplicar SQL. Tú SÍ, de dos formas:

### Opción A: Supabase Dashboard
1. Ir a https://supabase.com/dashboard
2. Seleccionar el proyecto saas_core
3. SQL Editor → New query
4. Pegar el contenido de `supabase/migrations/20260713_hq_rpcs.sql`
5. Run

### Opción B: Supabase CLI
```bash
supabase db push
# o si es migración nueva:
supabase migration up
```

**ANTES de aplicar el SQL**, lee la migración y verifica:
- Que `tenants.deleted_at` no choque con columnas existentes.
- Que `audit_log` no exista ya (si existe, Gemini lo documentó).
- Que las RPCs `suspend_tenant` etc. no existan ya.

**Si TODO está OK, aplica. Si NO, consulta al usuario antes de modificar la migración.**

### Verificación post-SQL

Después de aplicar:
```sql
-- En SQL Editor de Supabase
SELECT proname FROM pg_proc WHERE pronamespace = 'public'::regnamespace;
-- Debe incluir: is_super_admin, suspend_tenant, update_tenant_token_limit, delete_tenant_permanently

SELECT column_name FROM information_schema.columns 
WHERE table_name = 'tenants' AND column_name = 'deleted_at';
-- Debe retornar 1 fila

SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_log');
-- Debe retornar true
```

---

## DECISIONES A TOMAR

Después de verificar, debes presentar al usuario:

1. **Estado de verificación** (qué pasó, qué falló).
2. **SQL aplicado** (sí/no, con output).
3. **Commits aceptados** (cuáles, con hash).
4. **Riesgos residuales** (qué quedó pendiente o dudoso).
5. **Siguiente paso** (push, fix adicional, o continuar con Sprint 5.3).

**NUNCA hagas push sin autorización explícita del usuario.**

---

## ROLLBACK PLAN (si algo falla crítico)

Si encuentras algo irreparable (credenciales filtradas, build roto irreparable, R1 violación):

```bash
# Rollback del último commit de Gemini (5.2)
git reset --hard HEAD~1

# Si también 5.1 está mal, rollback ambos
git reset --hard 8af4a6b  # O el commit anterior a Gemini
```

**Después de rollback, documenta qué falló y por qué. NO intentes fixearlo en el momento — consulta al usuario primero.**

---

## ENTREGABLE FINAL (lo que le darás al usuario)

```markdown
# 🎼 Reporte de Orquestación — Sprints 5.1 + 5.2

## Verificación
- [ ] R0: No hay credenciales filtradas
- [ ] R1: Build Exit 0
- [ ] R2: `createAdminClient()` solo en lugares permitidos
- [ ] R6: Diffs visibles correctos
- [ ] R7: 2 commits (uno por sprint)

## SQL
- [ ] Aplicado en Supabase
- [ ] RPCs verificadas con `SELECT proname FROM pg_proc`

## Commits aceptados
- 5.1: `[hash] [mensaje]`
- 5.2: `[hash] [mensaje]`

## Build output (últimas 30 líneas)
[pega]

## Riesgos residuales
[lista]

## Siguiente paso
[push / fix / Sprint 5.3 / esperar autorización]
```

---

## CONTEXTO ADICIONAL QUE NECESITAS RESTAURAR

- **Reglas inquebrantables**: Ver `docs/history/GEMINI_PROTOCOL.md` (R1-R10). La más importante: R1 = build Exit 0 OBLIGATORIO antes de cualquier commit/push.
- **Seguridad multi-tenant**: Ver `docs/history/AGENTS_V2.md`. `createAdminClient()` solo en webhooks y Server Actions de /hq.
- **Schema actual**: `tenants` columnas: `id, name, subdomain, is_active, ai_token_limit, ai_tokens_used, owner_id, created_at, payment_status, stripe_customer_id, stripe_subscription_id, deleted_at (nueva)`. `profiles` columnas incluyen `role` (con valores `'super_admin'`, `'admin'`, `'user'`).
- **Routing**: Subdominios via `src/proxy.ts:38`. `hq.${ROOT_DOMAIN}/*` → `/hq/*`. NO crear `/admin` legacy.
- **No `git push` sin autorización explícita.**

---

## SI ALGO FALLA O NO ENTIENDES

PARA y pregunta al usuario. NO inventes. NO intentes fixear a ciegas. El principio es: "Privilegio de Duda Cero" para trabajo de Gemini (R0 del protocolo).

**Prioridad absoluta:** R1 (build) > R0 (credenciales) > todo lo demás.
