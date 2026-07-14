# 🎨 PROMPT GEMINI — Sprint 5.2: UI Acid Brutalist Dark Mode

> **Modo de uso:** Copia TODO este archivo y pégalo como primer mensaje de un NUEVO chat de Gemini (sin contexto previo). Adjunta el repositorio `saas_core` como contexto. Gemini NO tiene memoria entre chats, así que este archivo es su única fuente de verdad.
>
> **PRERREQUISITO:** Sprint 5.1 YA está aplicado. El branch actual está en el commit `feat(sprint-5): centralize super admin auth and add destructive RPCs` o posterior. Si no es así, PARA y pregunta.

---

## TU ROL

Eres el **Ingeniero Frontend** del SaaS Multi-Tenant `saas_core` (Next.js 16 + Supabase + Stripe). Estás ejecutando **Sprint 5.2** del roadmap. Tu trabajo es:

1. Aplicar el sistema de diseño "Acid Brutalist Dark Mode" al panel `/hq`.
2. Agregar tokens CSS y tipografía Space Grotesk.
3. Rediseñar layout, métricas, tabla, formularios de creación/edición.
4. **NO** tocar backend. **NO** modificar RPCs. **NO** cambiar SQL.
5. **NO** modificar APIs (`/api/*`). **NO** modificar el panel `/console` del tenant.

---

## DOCUMENTOS OBLIGATORIOS QUE DEBES LEER PRIMERO (en este orden)

1. `docs/history/GEMINI_PROTOCOL.md` — Reglas R1-R10. Léelo completo. Si rompes R1 (BUILD = GATE ABSOLUTO), tu commit será rechazado.
2. `docs/history/AGENTS_V2.md` — Reglas de seguridad multi-tenant innegociables.
3. `docs/history/PROMPT_GEMINI_SPRINT_5_1.md` — Lo que hizo el Sprint 5.1 (para saber qué archivos NO tocar).
4. `ARCHITECTURE.md` (raíz) — Estado actual.

**Si alguno NO existe, PARA y pregunta. NO inventes.**

---

## SKILLS DE ANTIGRAVITY QUE DEBES USAR

Tienes 25 skills en `~/.gemini/antigravity/skills/`. Usa estas en este orden:

### Paso 0: `00_workspace_forensics`
Mapea el estado real del repo. Tu mapa. Sin él, estás trabajando a ciegas.

### Paso 1: `18_pre_action_guard` (antes de cada cambio)
Valida: no rompe R1 (build), no rompe consumers, no inventa rutas.

### Paso 2: `19_adversarial_reviewer` (después de cada cambio)
Busca: vulnerabilidades, drift de schema, código muerto, inconsistencias.

### Paso 3: `07_deterministic_planner` (al inicio)
Genera plan determinístico paso a paso antes de codear.

### Paso 4: `06_error_recovery` (si algo falla)
Si `npm run build` falla 2 veces seguidas por el mismo motivo. NO inventes soluciones.

### Paso 5: `20_failure_postmortem` (al final, si algo salió mal)
Si tuviste que revertir o descartar trabajo.

---

## EL PLAN — SPRINT 5.2 (léelo completo antes de empezar)

### Contexto del problema

El panel `/hq` actualmente funciona (commit de Sprint 5.1) pero tiene **diseño genérico Shadcn** con `bg-neutral-900/50 border-neutral-800`. El usuario quiere **"Acid Brutalist Dark Mode"**:

- Fondos casi-negros profundos
- Tarjetas con bordes sólidos
- Acento verde neón/ácido
- Tipografía monoespaciada para datos, geométrica para UI
- Bordes "brutalistas" (2px sólidos, sin sombras suaves)
- Glow neón sutil en CTAs primarios

### Archivos que vas a tocar (8 total)

| # | Path | Acción | Líneas estimadas |
|---|---|---|---|
| 1 | `src/app/globals.css` | Agregar tokens `--acid-*` y utility classes | +30 |
| 2 | `src/app/layout.tsx` | Importar `Space_Grotesk` y exponer como `--font-grotesk` | +8 |
| 3 | `src/app/hq/layout.tsx` | **REDISEÑO COMPLETO** con tokens Acid Brutalist | +60 / -40 |
| 4 | `src/app/hq/components/GlobalMetricsCards.tsx` | Rediseño con border-brutal + neon glow | +20 / -15 |
| 5 | `src/app/hq/components/TenantsDirectoryTable.tsx` | Tabla con monospace + filas hover-brutal | +25 / -10 |
| 6 | `src/app/hq/components/CreateTenantForm.tsx` | Form con border-2 brutal + neon CTA | +15 / -10 |
| 7 | `src/app/hq/components/UpdateTokenLimitForm.tsx` | Input con `font-geist-mono` y border-brutal | +8 / -3 |
| 8 | `src/app/hq/components/DeleteTenantForm.tsx` | Reemplazar `confirm()` por Dialog de Shadcn | +5 / -3 |

**Total: 0 archivos nuevos, 8 modificados, ~176 líneas.**

**Componentes Shadcn nuevos a instalar:**
- `npx shadcn@latest add dialog` (para confirmaciones).
- `npx shadcn@latest add sonner` (toasts de feedback).

**Verificación:**
- `npm run build` → Exit 0.
- Commit `feat(sprint-5): apply acid brutalist design to hq dashboard`.

**Lo que NO se hace:**
- ❌ No se cambian APIs.
- ❌ No se tocan otros paneles (`/console` del tenant).
- ❌ No se agrega audit log UI (eso es Sprint 5.3).
- ❌ No se modifica SQL ni RPCs.

---

## SISTEMA DE DISEÑO "Acid Brutalist Dark Mode"

### Tokens (definidos en `globals.css`)

```css
:root {
  --acid-bg: #050505;          /* Fondo principal */
  --acid-card: #0D0D0D;        /* Tarjetas */
  --acid-border: #1A1A1A;      /* Bordes */
  --acid-border-hover: #2A2A2A; /* Bordes en hover */
  --acid-neon: #C1FF00;        /* Verde neón/ácido (acento) */
  --acid-neon-dim: #8FB800;    /* Neón atenuado (texto secundario) */
  --acid-text: #E5E5E5;        /* Texto principal */
  --acid-text-dim: #888888;    /* Texto secundario */
  --acid-danger: #FF3D3D;      /* Rojo destructivo */
  --acid-warn: #FFB800;        /* Amarillo advertencia */
}
```

### Tipografía

- **Space Grotesk** (Google Font) — agregar a `src/app/layout.tsx` como `--font-grotesk`.
- Ya tienes `Playfair_Display` (--font-serif), `Plus_Jakarta_Sans` (--font-sans), `Geist_Mono` (--font-geist-mono). Mantener.
- En `/hq/layout.tsx` usar `font-grotesk` o `var(--font-grotesk)`.

### Componentes Shadcn UI disponibles

Ya tienes: `button, card, badge, table, sheet, sidebar, dropdown-menu, input, separator, skeleton, tooltip, avatar, breadcrumb`.

Faltan para `/hq`:
- `dialog` (confirmaciones destructivas, en lugar de `window.confirm`).
- `sonner` (toasts de feedback).

**Decisión:** Instala estos 2 con `npx shadcn@latest add dialog sonner`. NO agregues más.

---

## IMPLEMENTACIÓN DETALLADA (sigue esto AL PIE DE LA LETRA)

### 1. `src/app/globals.css` (MODIFICAR)

Agrega los tokens dentro de `:root` o `@layer base`. Si ya tienes `:root` con otras variables, agrégalas al mismo bloque:

```css
@layer base {
  :root {
    /* Tokens existentes ... */
    
    /* Acid Brutalist Tokens */
    --acid-bg: #050505;
    --acid-card: #0D0D0D;
    --acid-border: #1A1A1A;
    --acid-border-hover: #2A2A2A;
    --acid-neon: #C1FF00;
    --acid-neon-dim: #8FB800;
    --acid-text: #E5E5E5;
    --acid-text-dim: #888888;
    --acid-danger: #FF3D3D;
    --acid-warn: #FFB800;
  }
}

/* Utility classes para componentes */
@layer utilities {
  .border-brutal {
    border: 2px solid var(--acid-border);
  }
  .border-brutal-hover:hover {
    border-color: var(--acid-border-hover);
  }
  .neon-glow {
    box-shadow: 0 0 12px rgba(193, 255, 0, 0.3);
  }
  .neon-text {
    color: var(--acid-neon);
    text-shadow: 0 0 8px rgba(193, 255, 0, 0.4);
  }
}
```

### 2. `src/app/layout.tsx` (MODIFICAR)

Importa `Space_Grotesk` de `next/font/google` y exponlo como `--font-grotesk`:

```ts
import { Space_Grotesk } from 'next/font/google';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-grotesk',
});

// En el return, agrega spaceGrotesk.variable al className del <html>:
<html lang="es" className={`${spaceGrotesk.variable} ...existing classes...`}>
```

### 3. `src/app/hq/layout.tsx` (REDISEÑO COMPLETO)

Reemplaza el sidebar actual con estética Acid Brutalist:

```tsx
import { ReactNode } from "react"
import { ShieldAlert, LogOut, LayoutDashboard, Settings } from "lucide-react"

export default function SuperAdminLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div 
      className="min-h-screen flex"
      style={{ 
        backgroundColor: 'var(--acid-bg)', 
        color: 'var(--acid-text)',
        fontFamily: 'var(--font-grotesk), sans-serif'
      }}
    >
      {/* Sidebar - Acid Brutalist */}
      <aside 
        className="w-64 border-r-2 flex flex-col p-6"
        style={{ 
          backgroundColor: 'var(--acid-card)', 
          borderColor: 'var(--acid-border)' 
        }}
      >
        <div className="flex items-center gap-3 mb-12">
          <div 
            className="p-2 rounded-md"
            style={{ 
              backgroundColor: 'var(--acid-bg)', 
              color: 'var(--acid-neon)',
              border: '2px solid var(--acid-neon)',
              boxShadow: '0 0 12px rgba(193, 255, 0, 0.3)'
            }}
          >
            <ShieldAlert size={20} />
          </div>
          <div>
            <h2 
              className="font-bold text-sm tracking-widest"
              style={{ color: 'var(--acid-text)' }}
            >
              SUPER ADMIN
            </h2>
            <p 
              className="text-[10px] uppercase tracking-widest"
              style={{ color: 'var(--acid-text-dim)' }}
            >
              Geo-Dev Core
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <a 
            href="/hq" 
            className="flex items-center gap-3 text-sm px-4 py-2.5 rounded-md transition-all"
            style={{ 
              backgroundColor: 'var(--acid-bg)',
              color: 'var(--acid-neon)',
              border: '1px solid var(--acid-neon)'
            }}
          >
            <LayoutDashboard size={18} />
            Tenants
          </a>
          <a 
            href="#" 
            className="flex items-center gap-3 text-sm px-4 py-2.5 rounded-md transition-all"
            style={{ color: 'var(--acid-text-dim)' }}
          >
            <Settings size={16} />
            System Config
          </a>
        </nav>

        <div 
          className="pt-6"
          style={{ borderTop: '2px solid var(--acid-border)' }}
        >
          <a 
            href="/login?logout=true" 
            className="flex items-center gap-3 text-sm px-4 py-2 rounded-md transition-all"
            style={{ color: 'var(--acid-danger)' }}
          >
            <LogOut size={16} />
            Sign Out
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
```

### 4. `src/app/hq/components/GlobalMetricsCards.tsx` (REDISEÑO)

Reemplaza `bg-neutral-900/50 border-neutral-800` por tokens Acid. Cada card:
- `backgroundColor: var(--acid-card)`
- `border: 2px solid var(--acid-border)`
- En hover: `border-color: var(--acid-border-hover)`
- El valor numérico: `font-family: var(--font-geist-mono)`, `color: var(--acid-neon)`
- Label: `color: var(--acid-text-dim)`, `text-transform: uppercase`, `letter-spacing: widests`

### 5. `src/app/hq/components/TenantsDirectoryTable.tsx` (REDISEÑO)

- Container: `backgroundColor: var(--acid-card)`, `border: 2px solid var(--acid-border)`
- Header de tabla: `backgroundColor: var(--acid-bg)`, `color: var(--acid-text-dim)`, `text-transform: uppercase`, `font-size: 10px`, `letter-spacing: widest`
- Filas: hover con `backgroundColor: var(--acid-bg)` y `border-left: 2px solid var(--acid-neon)` (efecto stripe)
- Celdas de datos numéricos: `font-family: var(--font-geist-mono)`
- Badges de status (`is_active`): `color: var(--acid-neon)` si activo, `color: var(--acid-text-dim)` si inactivo

### 6. `src/app/hq/components/CreateTenantForm.tsx` (REDISEÑO)

- Input fields: `backgroundColor: var(--acid-bg)`, `border: 2px solid var(--acid-border)`, focus `border-color: var(--acid-neon)`
- Botón submit: `backgroundColor: var(--acid-neon)`, `color: var(--acid-bg)`, `font-weight: bold`, hover con `box-shadow: 0 0 12px rgba(193, 255, 0, 0.5)`
- Labels: `color: var(--acid-text-dim)`, `text-transform: uppercase`, `font-size: 10px`

### 7. `src/app/hq/components/UpdateTokenLimitForm.tsx` (REDISEÑO)

- Input numérico: `font-family: var(--font-geist-mono)`, `backgroundColor: var(--acid-bg)`, `border: 2px solid var(--acid-border)`
- Botón SAVE: `backgroundColor: var(--acid-neon)`, `color: var(--acid-bg)`, monospace
- Icono Zap: `color: var(--acid-neon)` con `filter: drop-shadow(0 0 4px rgba(193, 255, 0, 0.5))`

### 8. `src/app/hq/components/DeleteTenantForm.tsx` (REDISEÑO + Dialog)

Reemplaza el `window.confirm()` por un Dialog de Shadcn:

```tsx
"use client";

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export function DeleteTenantForm({ 
  tenantId, 
  tenantName, 
  action 
}: { 
  tenantId: string, 
  tenantName: string, 
  action: (formData: FormData) => Promise<void> 
}) {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleDelete = async (formData: FormData) => {
    setIsPending(true);
    await action(formData);
    setIsPending(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button 
          className="px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer"
          style={{
            backgroundColor: 'transparent',
            color: 'var(--acid-danger)',
            border: '1px solid var(--acid-danger)'
          }}
        >
          Eliminar
        </button>
      </DialogTrigger>
      <DialogContent 
        style={{ 
          backgroundColor: 'var(--acid-card)', 
          border: '2px solid var(--acid-border)',
          color: 'var(--acid-text)'
        }}
      >
        <DialogHeader>
          <DialogTitle style={{ color: 'var(--acid-danger)' }}>
            ¿Eliminar tenant?
          </DialogTitle>
          <DialogDescription style={{ color: 'var(--acid-text-dim)' }}>
            Vas a eliminar <strong>{tenantName}</strong>. Esta acción es irreversible
            y borrará todas las citas, clientes y configuraciones.
          </DialogDescription>
        </DialogHeader>
        <form action={handleDelete}>
          <input type="hidden" name="id" value={tenantId} />
          <DialogFooter>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-4 py-2 text-sm rounded-md"
              style={{
                backgroundColor: 'transparent',
                color: 'var(--acid-text-dim)',
                border: '1px solid var(--acid-border)'
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 text-sm font-bold rounded-md"
              style={{
                backgroundColor: 'var(--acid-danger)',
                color: 'white'
              }}
            >
              {isPending ? 'Eliminando...' : 'Eliminar'}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

**Nota sobre la firma de `action`:** El componente anterior recibía `action: (formData: FormData) => Promise<void>`. Como ahora lo envolvemos en un form local con `handleDelete`, la firma sigue siendo compatible. NO cambies la firma del componente (quien lo usa en `TenantsDirectoryTable.tsx` no debe romperse).

---

## REGLAS INQUEBRANTABLES (de GEMINI_PROTOCOL.md)

1. **R1 — BUILD = GATE ABSOLUTO.** NINGÚN commit sin `npm run build` Exit 0. DEBES mostrar las últimas 30 líneas del output.
2. **R2 — DELETE = VERIFICACIÓN.** Antes de borrar cualquier archivo, `grep -rln` para verificar consumers.
3. **R6 — Diffs visibles.** Antes de `git commit`, ejecuta `git diff --stat` y muéstralo.
4. **R7 — UN commit por sprint.** Mensaje conventional: `feat(sprint-5): apply acid brutalist design to hq dashboard`.
5. **R8 — Documenta archivos huérfanos.** Si ves untracked, repórtalo.
6. **R9 — Walkthrough = Auditoría Real.** Al terminar, dame: `git show --stat` + output del build + justificación de cada archivo modificado.
7. **R10 — Si te atascas, PARA y pregunta.** No inventes.

---

## ENTREGABLE FINAL (lo que necesito de ti al terminar)

```markdown
# Walkthrough Sprint 5.2

## Archivos modificados
[pégame `git show --stat HEAD`]

## Componentes Shadcn instalados
- dialog
- sonner

## Build output (últimas 30 líneas)
[pega el output de `npm run build`]

## Verificaciones
- [ ] R1: Build Exit 0 verificado
- [ ] Tokens `--acid-*` agregados a `globals.css`
- [ ] Space Grotesk importado y expuesto como `--font-grotesk`
- [ ] Sidebar rediseñado con bordes 2px y neon-glow
- [ ] Tabla rediseñada con monospace + hover stripe
- [ ] DeleteTenantForm usa Dialog (no más `window.confirm`)
- [ ] NO se modificó `/api/*`
- [ ] NO se modificó `/console/*`
- [ ] NO se modificó SQL ni RPCs

## Commit
[pega el hash y el mensaje del commit]

## Deuda conocida (si quedó algo)
[lista de cosas que NO pudiste hacer y por qué]
```

---

## CHECKLIST ANTES DE EMPEZAR

- [ ] Leí los 4 documentos obligatorios (GEMINI_PROTOCOL, AGENTS_V2, PROMPT_GEMINI_SPRINT_5_1, ARCHITECTURE)
- [ ] Ejecuté `00_workspace_forensics` para mapear el estado real
- [ ] Verifiqué que Sprint 5.1 YA está aplicado (commit presente en el log)
- [ ] Working tree limpio (`git status` debe decir "nothing to commit")
- [ ] Tengo claras las reglas R1-R10

**Si CUALQUIER checkbox falla, PARA y pregunta antes de codear.**
