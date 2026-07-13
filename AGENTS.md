<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:context-saturation-rules -->
# Context Saturation & Migration Protocol

As an AI agent, you must constantly monitor the length and complexity of the current conversation. When the chat history becomes too long, it degrades performance, consumes excessive tokens, and risks context loss.
You must proactively warn the user when the context is saturated or about to be. Say something like: *"⚠️ ALERTA DE SATURACIÓN: Este chat está consumiendo demasiados tokens y perdiendo agilidad. Por favor, genera un resumen y migremos a una nueva sesión sin que el usuario tenga que pedirlo."*
When migrating, you must generate a comprehensive "Context Transfer Prompt" that the user can paste into the new chat to instantly onboard the next agent with exact file paths, current sprint status, and next steps.
<!-- END:context-saturation-rules -->

<!-- BEGIN:deployment-protocol -->
# 🚨 Deployment Protocol (MANDATORY — ZERO EXCEPTIONS)

## Golden Rule: BUILD BEFORE COMMIT
**Every agent MUST run `npm run build` locally and verify ZERO errors BEFORE creating any git commit.** A commit that breaks the build is an unacceptable waste of Vercel build minutes and risks shipping broken code to production.

### Pre-Commit Checklist (Execute in order)
1. **Save all files** — Ensure no unsaved changes exist.
2. **Run `npm run build`** — Wait for it to complete fully.
3. **Verify zero errors** — If errors appear, FIX THEM before continuing. Do NOT commit hoping "Vercel will sort it out."
4. **Only then** — Create the git commit and push.

### If the Build Fails
- **FIX the error in the same working session.** Do NOT commit the broken code with a "fix: ..." follow-up. That pattern creates TWO deploys (one broken, one fix) instead of ONE clean deploy.
- If you cannot fix the build error after 3 attempts, STOP. Report the error to the user with the full error log. Do NOT push broken code.

## Git Commit Convention
Use [Conventional Commits](https://www.conventionalcommits.org/) format:
```
<type>(<scope>): <short description>

[optional body with details]
```

**Types:** `feat`, `fix`, `refactor`, `docs`, `chore`, `style`, `perf`, `test`
**Scope:** The component/area affected (e.g., `store`, `proxy`, `webhook`, `calendar`)

**Examples:**
- `feat(store): add Stripe Checkout integration for module purchases`
- `fix(proxy): resolve cookie domain for tenant subdomains`
- `refactor(webhook): use token map instead of nested ternaries`

### Rules
- **ONE logical change per commit.** Do not bundle unrelated changes.
- **Never commit secrets, API keys, or `.env` files.** Verify `.gitignore` is correct.
- **Squash fix-on-fix commits.** If you need multiple attempts to fix something, use `git commit --amend` or squash before pushing, so only ONE clean commit reaches `main`.

## Branch Strategy
- **`main` branch = PRODUCTION.** Every push to `main` triggers a Vercel production deploy.
- For risky or large changes, create a feature branch: `git checkout -b feat/feature-name`
- Only merge to `main` after local build passes.
- For small, confident changes (typos, copy, styles), direct push to `main` is acceptable IF the build passes locally first.

## Vercel Build Awareness
- **Plan:** Hobby (limited build minutes per month). Every failed deploy wastes quota.
- **Build time:** ~30-50 seconds. Running `npm run build` locally takes similar time — it is NOT optional.
- **The deploy log pattern `feat → Error → fix → Error → fix → Ready` is STRICTLY PROHIBITED.** This pattern wastes 3x the build minutes for what should be 1 deploy.

## Emergency: If Broken Code Reaches Production
1. Do NOT panic-push more commits. That makes it worse.
2. Run `npm run build` locally to reproduce the error.
3. Fix it ONCE, verify the build passes locally.
4. Push a single clean fix commit.
<!-- END:deployment-protocol -->

<!-- BEGIN:post-audit-rules -->
# 🚨 Reglas Post-Auditoría (2026-07-12)

> Estas reglas derivan de los 26 hallazgos críticos en `AUDIT_REPORT.md`. **No negociables.**

## Seguridad Multi-Tenant
- **NUNCA** uses `createAdminClient()` (service_role) en páginas públicas o componentes client. Solo en: webhooks, super-admin actions, y Server Actions con validación explícita de ownership.
- **SIEMPRE** valida `auth.getUser()` + `owner_id === user.id` en toda Server Action que toque datos de tenant.
- **NUNCA** aceptes `price`, `isAdmin`, `role`, ni `tenantId` del body del request sin validar contra DB o sesión.

## Drift de Schema
- La DB real tiene `ai_token_limit` (sin "s") y `ai_tokens_used`. La columna `ai_tokens_limit` (con "s") es LEGACY y debe eliminarse.
- `extra_modules` existe en `tenants` y `business_settings` pero NO se usa en código. Pendiente DROP.
- Antes de INSERT/UPDATE de columnas de tenant, **lee `types/supabase-generated.ts`** para confirmar el nombre exacto.

## Routing Multi-Tenant
- El proxy reescribe a 4 destinos: `hq.*` → `/hq/*`, `app.*` → `/console/*`, raíz → `/`, subdominios/custom → `/[domain]/*`.
- Hay DUPLICIDAD entre `/console` (con actions) y `/hq` (sin actions). **Decisión Sprint 1.**
- `src/app/[domain]/admin/*` es LEGACY y se eliminará en Sprint 1.

## Build & Deploy
- `npm run build` antes de CADA commit (ver protocolo arriba).
- Build actual: Exit 0, 17 rutas, ~109s.

## Verificación Pre-Commit
- ¿El cambio preserva aislamiento de tenant? (owner_id check)
- ¿El cambio elimina o reduce superficie de ataque?
- ¿El cambio tiene evidencia runtime? (curl, PostgREST, browser)
<!-- END:post-audit-rules -->
