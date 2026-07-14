import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(
  request: NextRequest, 
  response: NextResponse, 
  options: { isAdminApp?: boolean, isSuperAdminApp?: boolean } = {}
) {
  const { isAdminApp = false, isSuperAdminApp = false } = options;
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          const host = request.headers.get('host') || '';
          const isLocal = process.env.NODE_ENV === 'development';
          let cookieDomain: string | undefined = undefined;
          
          if (isLocal) {
            cookieDomain = 'localhost';
          } else if (host.includes('geo-dev.online')) {
            cookieDomain = '.geo-dev.online';
          }

          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          cookiesToSet.forEach(({ name, value, options }) => {
            if (cookieDomain) {
              response.cookies.set(name, value, { ...options, domain: cookieDomain })
            } else {
              const { domain, ...safeOptions } = options;
              response.cookies.set(name, value, { ...safeOptions })
            }
          })
        },
      },
    }
  )

  // Redirect /hq to 404 in production (hide secret route)
  if (request.nextUrl.pathname.startsWith('/hq') && process.env.NODE_ENV === 'production') {
    return new NextResponse('Not Found', { status: 404 });
  }

  // This will refresh session if expired - required for Server Components
  // https://supabase.com/docs/guides/auth/server-side/nextjs
  const { data: { user } } = await supabase.auth.getUser()

  const isAuthRoute = request.nextUrl.pathname.startsWith('/login')
  
  // 0. EMAIL WHITELIST ENFORCEMENT (Database-backed with fallback)
  // If user is authenticated but email not in whitelist, force logout
  if (user && user.email) {
    // Fallback whitelist for when migration hasn't been run yet
    const FALLBACK_WHITELIST = ['cesargeo56@gmail.com'];
    
    const { data: isWhitelisted, error } = await supabase
      .rpc('is_email_whitelisted', { check_email: user.email });
    
    // If RPC fails (function doesn't exist), use fallback whitelist
    // If RPC succeeds, use database result
    const allowed = error ? FALLBACK_WHITELIST.includes(user.email) : !!isWhitelisted;
    
    if (!allowed) {
      await supabase.auth.signOut()
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = '/login'
      loginUrl.searchParams.set('error', 'unauthorized-email')
      return NextResponse.redirect(loginUrl)
    }
  }

  // 1. Proteger rutas de Super Admin
  if (isSuperAdminApp) {
    // Si no hay user, forzar login
    if (!user && !isAuthRoute) {
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = '/login'
      return NextResponse.redirect(loginUrl)
    }

    const { isSuperAdmin: checkIsSuperAdmin } = await import('@/lib/auth/super-admin');
    const isSuperAdmin = await checkIsSuperAdmin(supabase, user?.id || null);

    // Si hay user, validar que sea el email autorizado
    if (user && !isSuperAdmin) {
      const unauthorizedUrl = request.nextUrl.clone()
      unauthorizedUrl.pathname = '/login'
      unauthorizedUrl.searchParams.set('error', 'unauthorized')
      return NextResponse.redirect(unauthorizedUrl)
    }

    // Si ya está logueado y es superadmin, no dejarlo ir al /login del superadmin
    if (user && isAuthRoute && isSuperAdmin) {
      const superAdminUrl = request.nextUrl.clone()
      superAdminUrl.pathname = '/'
      return NextResponse.redirect(superAdminUrl)
    }
  }

  // 2. Proteger rutas de Tenant Admin (SaaS Core)
  if (isAdminApp && !isSuperAdminApp) {
    if (!user && !isAuthRoute && (request.nextUrl.pathname.startsWith('/console') || request.nextUrl.pathname === '/')) {
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = '/login'
      return NextResponse.redirect(loginUrl)
    }

    if (user && isAuthRoute) {
      const adminUrl = request.nextUrl.clone()
      adminUrl.pathname = '/console'
      return NextResponse.redirect(adminUrl)
    }
  }

  return response
}