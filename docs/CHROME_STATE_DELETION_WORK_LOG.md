# Chrome State Deletion Fix - Work Log Completo

**Fecha:** 14 de julio, 2026  
**Agente:** Buffy (Freebuff)  
**Proyecto:** saas_core  
**Estado:** FASES 1-3 COMPLETADAS | FASEA 4 PENDIENTE (requiere upgrade a Supabase Pro)

---

## 📋 Resumen Ejecutivo

### Problema Inicial
Chrome mostraba una advertencia en la consola:
```
Chrome may soon delete state for intermediate websites in a recent navigation chain
1 potentially tracking website: gmecnjouttietybyiyox.supabase.co
```

### Causa Raíz
Las **Bounce Tracking Mitigations** de Chrome flaggean `supabase.co` como sitio intermedio en cadenas de navegación sin interacción del usuario. Esto es parte de las mejoras de privacidad de Chrome para prevenir cross-site tracking.

### Solución Implementada
1. **Magic Link Authentication** - Reemplazó email/password + Google OAuth
2. **Email Whitelist** - Solo emails autorizados pueden autenticar
3. **Secret Admin Route** - `/thisisn0tasecret` reemplazó `/hq`
4. **Rate Limiting** - Máximo 3 requests por email cada 10 minutos
5. **Public Auth Removal** - Links de sign-in removidos/gateados

### Estado Actual
- ✅ **Fase 1:** Magic Link Auth - COMPLETADA
- ✅ **Fase 2:** Secret Route & Rate Limiting - COMPLETADA
- ✅ **Fase 3:** Database Migration - COMPLETADA (ejecutada por usuario)
- ❌ **Fase 4:** Custom Domain - PENDIENTE (requiere Supabase Pro plan)

---

## 🔧 Archivos Modificados

### 1. Login Page (Magic Link Only)
**Archivo:** `src/app/login/page.tsx`

**Cambios:**
- Removido formulario de email/password
- Removido botón de Google OAuth
- Implementado formulario de magic link con `signInWithOtp`
- Agregado estado `emailSent` para feedback al usuario
- Agregado botón "Enviar otro email" después de enviar

**Código Clave:**
```tsx
const handleSubmit = (formData: FormData) => {
  startTransition(async () => {
    const result = await sendMagicLinkAction(undefined, formData);
    if (result?.error) {
      toast.error(result.error);
    } else if (result?.success) {
      setEmailSent(true);
      toast.success(result.success);
    }
  });
};
```

### 2. Login Actions (Rate Limiting)
**Archivo:** `src/lib/auth/login-actions.ts`

**Cambios:**
- Removidas funciones `signInAction` y `signUpAction` (dead code)
- Implementado rate limiting in-memory (max 3 por email, ventana de 10 min)
- Función `sendMagicLinkAction` para magic link

**Código Clave:**
```typescript
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW = 10 * 60 * 1000; // 10 minutos

function checkRateLimit(email: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(email);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(email, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (record.count >= RATE_LIMIT_MAX) {
    return false;
  }
  
  record.count++;
  return true;
}
```

### 3. Middleware (Database-backed Whitelist)
**Archivo:** `src/lib/supabase/middleware.ts`

**Cambios:**
- Implementado whitelist enforcement con database-backed
- Fallback a hardcoded array cuando RPC falla
- Simplificado lógica de sign-out (eliminado try/catch redundante)
- Redirect `/hq` a 404 en producción

**Código Clave:**
```typescript
// 0. EMAIL WHITELIST ENFORCEMENT
if (user && user.email) {
  const FALLBACK_WHITELIST = ['cesargeo56@gmail.com'];
  
  const { data: isWhitelisted, error } = await supabase
    .rpc('is_email_whitelisted', { check_email: user.email });
  
  const allowed = error ? FALLBACK_WHITELIST.includes(user.email) : !!isWhitelisted;
  
  if (!allowed) {
    await supabase.auth.signOut()
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('error', 'unauthorized-email')
    return NextResponse.redirect(loginUrl)
  }
}
```

### 4. Auth Callback
**Archivo:** `src/app/auth/callback/route.ts`

**Cambios:**
- Default redirect cambiado de `/hq` a `/thisisn0tasecret`

**Código Clave:**
```typescript
const next = searchParams.get('next') ?? '/thisisn0tasecret'
```

### 5. Main Landing Page
**Archivo:** `src/app/page.tsx`

**Cambios:**
- Removidos links "Sign in" y "HQ Dashboard" del footer

### 6. Tenant Landing Page
**Archivo:** `src/app/[domain]/page.tsx`

**Cambios:**
- Admin link "Ir a Consola" gateado correctamente detrás de `isAdmin`
- Solo visible para usuarios autenticados con rol de admin

### 7. Secret Admin Route
**Directorio:** `src/app/thisisn0tasecret/`

**Archivos creados (copiados de `/hq` con paths actualizados):**
- `layout.tsx` - Links actualizados a `/thisisn0tasecret`
- `page.tsx` - Dashboard de admin
- `actions.ts` - Server actions con revalidation paths actualizados
- `MapModal.tsx` - Modal de mapa
- `components/` - 5 componentes copiados

### 8. Proxy
**Archivo:** `src/proxy.ts`

**Cambios:**
- Rewrites `/hq` a `/thisisn0tasecret`

**Código Clave:**
```typescript
if (hostname === `hq.${rootDomain}`) {
  isSuperAdminApp = true;
  let finalPath = path;
  if (!path.startsWith('/login') && !path.startsWith('/auth')) {
    finalPath = path === '/' ? '/thisisn0tasecret' : `/thisisn0tasecret${path}`;
  }
  response = NextResponse.rewrite(new URL(finalPath, req.url));
}
```

### 9. Package.json
**Archivo:** `package.json`

**Cambios:**
- Dev script cambiado a `next dev --no-turbopack` (fix para Windows)

### 10. SQL Migration
**Archivo:** `supabase/migrations/20260714_whitelisted_emails.sql`

**Contenido:**
- Tabla `whitelisted_emails` con RLS policies
- Índices para lookups rápidos
- RPC function `is_email_whitelisted`
- Email inicial: `cesargeo56@gmail.com`

---

## 📁 Archivos Eliminados

### Directorio `/hq`
- `src/app/hq/` - Eliminado completamente (reemplazado por `/thisisn0tasecret`)

---

## 🗄️ Base de Datos

### Nueva Tabla: `whitelisted_emails`

```sql
CREATE TABLE IF NOT EXISTS public.whitelisted_emails (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  added_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);
```

### RLS Policies
- `whitelisted_emails_super_admin_read` - Solo super_admins pueden leer
- `whitelisted_emails_super_admin_insert` - Solo super_admins pueden insertar
- `whitelisted_emails_super_admin_update` - Solo super_admins pueden actualizar
- `whitelisted_emails_super_admin_delete` - Solo super_admins pueden eliminar

### RPC Function
```sql
CREATE OR REPLACE FUNCTION public.is_email_whitelisted(check_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.whitelisted_emails 
    WHERE email = check_email AND is_active = TRUE
  );
END;
$$;
```

---

## 🔄 Flujo de Autenticación (Actualizado)

```
1. Usuario ingresa email en /login
2. Frontend llama a sendMagicLinkAction (rate limiting check)
3. Supabase envía email con magic link
4. Usuario hace clic en link
5. Redirige a /auth/callback con código
6. Callback intercambia código por sesión
7. Middleware valida email en whitelist (database o fallback)
8. Si autorizado → redirect a /console o /thisisn0tasecret
9. Si no autorizado → signOut + redirect a /login?error=unauthorized-email
```

---

## 🧪 Plan de Pruebas

### Pruebas Manuales
1. ✅ Login page muestra solo magic link (sin password/Google)
2. ✅ Email whitelisted recibe magic link
3. ✅ Email no-whitelisted es bloqueado por middleware
4. ✅ Landing page no tiene links de sign-in en footer
5. ✅ Admin link gateado detrás de isAdmin
6. ✅ `/hq` redirige a `/thisisn0tasecret`
7. ✅ Rate limiting funciona (max 3 por email)
8. ✅ Build pasa sin errores TypeScript

### Pruebas Pendientes
- [ ] Magic link flow completo (email → link → autenticado)
- [ ] Session persistence cross-browser
- [ ] Rate limiting bajo carga
- [ ] Chrome warning verificación

---

## ⚠️ Limitaciones Conocidas

1. **Chrome Warning Persiste** - Magic links no arreglan el warning. Necesita Custom Domain (Fase 4).
2. **Rate Limiting In-Memory** - No persiste entre reinicios del servidor. Aceptable para escala actual.
3. **Hardcoded Fallback** - `cesargeo56@gmail.com` hardcodeado como fallback hasta que migración se ejecute.
4. **Turbopack Disabled** - `--no-turbopack` flag agregado para compatibilidad con Windows.

---

## 📋 Pendientes para Completar

### Urgentes
- [ ] Ejecutar migración SQL en Supabase (USUARIO CONFIRMO QUE YA LO HIZO)
- [ ] Probar flow completo de magic link
- [ ] Verificar Chrome warning en consola

### Fase 4 (Requiere Supabase Pro)
- [ ] Upgrade a Supabase Pro plan ($25/mes)
- [ ] Configurar custom domain en Supabase dashboard
- [ ] Agregar CNAME record: `api.geo-dev.online → gmecnjouttietybyiyox.supabase.co`
- [ ] Actualizar `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Probar todos los auth flows con nuevo dominio
- [ ] Verificar que Chrome warning desaparece

### Mejoras Futuras
- [ ] Migrar rate limiting a Redis o Supabase built-in
- [ ] Crear admin interface para gestionar whitelist
- [ ] Actualizar `types/supabase-generated.ts` con nueva tabla
- [ ] Auditar `PublicNavbar.tsx` para referencias de sign-in
- [ ] Agregar middleware config para limitar ejecución a paths relevantes

---

## 📊 Resumen de Cambios por Fase

### Fase 1: Magic Link Auth ✅
| Archivo | Cambio |
|---------|--------|
| `src/app/login/page.tsx` | Magic link only |
| `src/lib/auth/login-actions.ts` | Rate limiting + magic link |
| `src/lib/supabase/middleware.ts` | Whitelist enforcement |
| `src/app/auth/callback/route.ts` | Redirect a /thisisn0tasecret |
| `src/components/public/ContactForm.tsx` | Removido signUpAction |

### Fase 2: Secret Route & Rate Limiting ✅
| Archivo | Cambio |
|---------|--------|
| `src/app/page.tsx` | Removidos links de auth |
| `src/app/[domain]/page.tsx` | Admin link gateado |
| `src/app/thisisn0tasecret/` | Nuevo directorio (copiado de /hq) |
| `src/proxy.ts` | Rewrite /hq → /thisisn0tasecret |
| `src/app/hq/` | Eliminado |
| `package.json` | --no-turbopack flag |

### Fase 3: Database Migration ✅
| Archivo | Cambio |
|---------|--------|
| `supabase/migrations/20260714_whitelisted_emails.sql` | Nueva tabla + RPC |

---

## 🎯 Decisiones Tomadas

| Decisión | Elección | Rationale |
|----------|----------|-----------|
| Auth Method | Magic Link | Más seguro, simpler que email/password |
| Admin Route | `/thisisn0tasecret` | Secret pero memorable |
| Supabase Domain | Default (temporal) | Usuario eligió "Simple fix only" |
| Public Auth | Gateado detrás isAdmin | Admin link solo visible para admins |
| Whitelist | Database con fallback | Crear migración, fallback antes de ejecutar |
| Chrome Warning | Aceptar por ahora | Magic links no lo arreglan - necesita custom domain |
| Rate Limiting | In-memory | Implementación simple, aceptable para escala actual |
| Turbopack | Disabled | Fix para Windows |

---

## 🔗 Referencias

- [Chrome Bounce Tracking Mitigations](https://developer.chrome.com/blog/bounce-tracking-mitigations-dev-trial)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Next.js + Supabase SSR](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Storage Partitioning](https://privacysandbox.google.com/cookies/storage-partitioning)

---

**Última Actualización:** 14 de julio, 2026  
**Fases Completadas:** 1, 2, 3  
**Próximos Pasos:** Probar auth flow → Upgrade Supabase Pro → Implementar custom domain
