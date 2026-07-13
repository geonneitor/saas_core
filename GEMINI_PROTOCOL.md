# 🚨 Protocolo Gemini para saas_core (ESTRICTO — LEER ANTES DE TOCAR NADA)

> **Origen:** Auditoría 2026-07-12 + walkthrough incompleto de Sprint 2.
> **Aplicación:** CADA sesión de Gemini en este repo. Sin excepciones.

---

## ⚠️ Regla 0 — Privilegio de Duda Cero

**Cualquier afirmación de Gemini sobre el estado del proyecto debe estar respaldada por uno de:**
- `npm run build` Exit 0
- `git status` sin cambios no stageados
- Output literal de un comando (NO resúmenes)
- `cat` o `Read` de un archivo que muestre la evidencia

**Si Gemini dice "X está hecho" sin output verificable, es FALSO hasta que demuestre lo contrario.**

---

## 📋 Las 10 Reglas de Operación

### R1. **BUILD = GATE ABSOLUTO**
- NINGÚN commit sin `npm run build` Exit 0 verificado en los últimos 5 minutos.
- Gemini DEBE mostrar las últimas 30 líneas del output del build.
- "El build pasó antes" NO cuenta. Debe pasar DESPUÉS de los cambios.

### R2. **DELETE = VERIFICACIÓN DE CONSUMIDORES**
Antes de borrar cualquier archivo, Gemini DEBE:
```bash
# Buscar TODOS los consumidores
grep -rln "NombreComponente\|ruta/al/archivo" src/
```
- Si hay **0 consumidores** → puede borrar.
- Si hay **≥1 consumidor** → DEBE migrar al nuevo path PRIMERO, luego borrar.
- NUNCA borrar a la fuerza con `-Force` sin documentar el riesgo.

### R3. **MOVE = ATOMIC + VERIFY**
Si reubica un archivo, en UN solo commit debe:
1. Crear el archivo en la nueva ubicación.
2. Actualizar TODOS los imports.
3. Borrar el archivo viejo.
4. Correr `npm run build`.
5. Si Exit 0, commit. Si falla, NO commitear.

### R4. **NO inventes rutas ni archivos**
- Las únicas rutas válidas son las de `proxy.ts:38-89` (ver `ARCHITECTURE.md`).
- NO crear `src/app/[domain]/admin/*` (legacy, ya borrado).
- NO renombrar `/console` ni `/hq` sin consultarme.

### R5. **NO toques credenciales ni .env**
- `STRIPE_SECRET_KEY`, `SUPABASE_*`, `.env.local` son INTOCABLES salvo que yo lo pida explícitamente.
- NO rotar keys, NO modificar `.env*`, NO imprimirlas en chat.

### R6. **Diffs visibles antes de commit**
- Antes de `git commit`, Gemini DEBE mostrar `git diff --stat` de los archivos modificados.
- Si un cambio parece sospechoso (muchas líneas, paths inesperados), Gemini DEBE pedir confirmación.

### R7. **UN commit por sprint/fase**
- NUNCA múltiples commits para un mismo sprint.
- Mensaje en conventional commits: `<type>(<scope>): <description>`.
- Body opcional explicando el POR QUÉ, no el QUÉ.

### R8. **Documenta archivos huérfanos**
- Si Gemini encuentra un archivo untracked (`git status`), DEBE decirme antes de decidir.
- `src/components/admin/StripeCheckoutButton.tsx` estuvo untracked por horas. Esto NO debe repetirse.

### R9. **Walkthrough = Auditoría Real**
- Si yo te pido un walkthrough, NO me des narrativa bonita. Dame:
  - Lista de archivos modificados con `git show --stat`
  - Output de `npm run build` con Exit code
  - Lista de archivos NUEVOS (untracked → tracked)
  - Lista de archivos BORRADOS con justificación de cada uno

### R10. **Si te quedas atascado, PARA y pregunta**
- Si un comando falla 2 veces seguidas, NO inventes soluciones.
- Reporta el error completo y espera mi input.

---

## 🛠️ Comandos que Gemini DEBE correr antes de declarar cualquier cosa terminada

### Antes de commit:
```bash
# 1. Ver qué se va a commitear
git status

# 2. Ver el diff
git diff --stat

# 3. Build de verificación (OBLIGATORIO)
npm run build
```

### Antes de borrar archivos:
```bash
# Buscar consumidores
grep -rln "NombreArchivo\|ruta/sin/extension" src/

# Si 0 consumidores, listar para confirmar
ls src/ruta/del/archivo/
```

### Antes de mover componentes:
```bash
# 1. Listar todos los imports actuales
grep -rln "from.*ruta/vieja" src/

# 2. Después de mover, verificar que se actualizaron TODOS
grep -rln "from.*ruta/vieja" src/   # debe dar 0
grep -rln "from.*ruta/nueva" src/   # debe dar el mismo número que antes
```

### Para validar estado de archivos admin legacy:
```bash
# Verificar que /admin NO existe
ls src/app/[domain]/admin 2>/dev/null && echo "FAIL" || echo "OK"

# Verificar consumidores de archivos admin
for f in src/components/admin/*.tsx; do
  n=$(basename "$f" .tsx)
  c=$(grep -rln "from.*admin/$n" src/ | grep -v "components/admin" | wc -l)
  echo "$n: $c consumer(s)"
done
```

---

## 📂 Estado Actual de Archivos "Inútiles" (verificado 2026-07-13)

| Archivo | Consumidores | Acción recomendada |
|---------|--------------|---------------------|
| `src/components/admin/app-sidebar.tsx` | 0 | 🗑️ **BORRAR** |
| `src/components/admin/InteractiveCalendar.tsx` | 0 | 🗑️ **BORRAR** |
| `src/components/admin/StripeCheckoutButton.tsx` | 1 (WalletDashboard) | ✅ Mantener |
| `src/components/admin/WalletDashboard.tsx` | 1 (console/billing) | ✅ Mantener |
| `src/store/useBookingStore.ts` | 1 (AiAssistantChat) | ⚠️ Mantener, agregar TODO para modal |
| `src/app/console/*` (raíz) | — | 🟡 Decidir: ¿consolidar con /hq? |
| `src/app/hq/*` | — | 🟡 Decidir: ¿consolidar con /console? |

---

## ✅ Checklist Final Antes de Declarar "Hecho"

```
[ ] npm run build → Exit 0
[ ] git status → solo archivos deseados modificados
[ ] git diff --stat → cambios entendibles y mínimos
[ ] 0 archivos untracked inesperados
[ ] Walkthrough entregado con: archivos modificados + build output + justificación
[ ] Si borré archivos: justifiqué cada uno con grep de consumidores
```

**Si CUALQUIER casilla falla, NO está hecho. Reportar y esperar.**
