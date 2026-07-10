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
          const domain = process.env.NODE_ENV === 'development' ? 'localhost' : '.geo-dev.online';
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, { ...options, domain })
          )
        },
      },
    }
  )

  // This will refresh session if expired - required for Server Components
  // https://supabase.com/docs/guides/auth/server-side/nextjs
  const { data: { user } } = await supabase.auth.getUser()

  const isAuthRoute = request.nextUrl.pathname.startsWith('/login')
  
  // 1. Proteger rutas de Super Admin
  if (isSuperAdminApp) {
    // Si no hay user, forzar login
    if (!user && !isAuthRoute) {
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = '/login'
      return NextResponse.redirect(loginUrl)
    }

    // Si hay user, validar que sea el email autorizado
    if (user && user.email !== 'cesargeo56@gmail.com') {
      // Intento de acceso no autorizado, patearlo.
      const unauthorizedUrl = request.nextUrl.clone()
      unauthorizedUrl.pathname = '/login' // podriamos mandarlo a un /unauthorized
      unauthorizedUrl.searchParams.set('error', 'unauthorized')
      // Cerramos su sesion en este flujo redireccionando o forzando logout? 
      // Por ahora solo no le dejamos ver el panel
      return NextResponse.redirect(unauthorizedUrl)
    }

    // Si ya está logueado y es superadmin, no dejarlo ir al /login del superadmin
    if (user && isAuthRoute && user.email === 'cesargeo56@gmail.com') {
      const superAdminUrl = request.nextUrl.clone()
      superAdminUrl.pathname = '/'
      return NextResponse.redirect(superAdminUrl)
    }
  }

  // 2. Proteger rutas de Tenant Admin (SaaS Core)
  if (isAdminApp && !isSuperAdminApp) {
    if (!user && !isAuthRoute && (request.nextUrl.pathname.startsWith('/admin') || request.nextUrl.pathname === '/')) {
      // Si no hay user, forzamos login.
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = '/login'
      return NextResponse.redirect(loginUrl)
    }

    // Si ya está logueado y trata de ir a login EN LA APP DE ADMIN, mandarlo al admin
    if (user && isAuthRoute) {
      const adminUrl = request.nextUrl.clone()
      adminUrl.pathname = '/admin'
      return NextResponse.redirect(adminUrl)
    }
  }

  return response
}
