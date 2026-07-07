import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest, response: NextResponse, isAdminApp: boolean = false) {
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

  // Proteger rutas de administración (SaaS Core)
  const isAuthRoute = request.nextUrl.pathname.startsWith('/login')
  
  if (isAdminApp && !user && !isAuthRoute && (request.nextUrl.pathname.startsWith('/admin') || request.nextUrl.pathname === '/')) {
    // Nota: en proxy.ts mapeamos / a /admin para el panel principal.
    // Si no hay user, forzamos login.
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    return NextResponse.redirect(loginUrl)
  }

  // Si ya está logueado y trata de ir a login EN LA APP DE ADMIN, mandarlo al admin
  if (isAdminApp && user && isAuthRoute) {
    const adminUrl = request.nextUrl.clone()
    adminUrl.pathname = '/admin'
    return NextResponse.redirect(adminUrl)
  }

  return response
}
