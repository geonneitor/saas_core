import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAppUrl } from '@/lib/utils'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  
  if (!code) {
    return NextResponse.redirect(new URL('/login?error=auth-code-error', request.url))
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)
  
  if (error) {
    console.error('[AUTH CALLBACK] exchangeCodeForSession error:', error.message)
    return NextResponse.redirect(new URL('/login?error=auth-code-error', request.url))
  }

  // Obtener el usuario para determinar a dónde redirigir
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.redirect(new URL('/login?error=auth-code-error', request.url))
  }
  
  // Verificar el rol del usuario (super_admin o agent)
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()
  
  const isSuperAdmin = profile?.role === 'super_admin'
  const isAgent = profile?.role === 'agent'
  const baseUrl = getAppUrl()
  
  if (isSuperAdmin) {
    return NextResponse.redirect(`${baseUrl}/thisisn0tasecret`)
  }

  if (isAgent) {
    return NextResponse.redirect(`${baseUrl}/agent`)
  }
  
  // Si no es super_admin ni agent, redirigir al console de su tenant (si tiene uno)
  const { data: tenant } = await supabase
    .from('tenants')
    .select('subdomain')
    .eq('owner_id', user.id)
    .maybeSingle()
  
  if (tenant) {
    const tenantUrl = getAppUrl('/console', tenant.subdomain)
    return NextResponse.redirect(tenantUrl)
  }
  
  // Sin tenant asignado — cerrar sesión y redirigir al login para evitar bucle
  await supabase.auth.signOut()
  return NextResponse.redirect(`${baseUrl}/login`)
}
