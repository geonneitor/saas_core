import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession } from './lib/supabase/middleware';

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (componentes internos de Next.js)
     * 3. /_static (archivos estáticos)
     * 4. /favicon.ico, /sitemap.xml, /robots.txt (archivos raíz estáticos)
     */
    '/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)',
  ],
};

export default async function middleware(req: NextRequest) {
  const url = req.nextUrl;

  // Obtenemos el hostname actual (ej: "mibarberia.localhost:3000" o "mibarberia.tusaas.com")
  let hostname = req.headers.get('host') || '';

  // Limpiamos el puerto en local para extraer solo el dominio
  hostname = hostname.replace(/:\d+$/, '');

  // Nuestro dominio base definido en .env (ej. localhost o tusaas.com)
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN?.replace(/:\d+$/, '') || 'localhost';

  // Extraemos el subdominio (Si el host es mibarberia.localhost, el subdominio es mibarberia)
  let isRootDomain = hostname === rootDomain;
  
  // Si estamos en Vercel y accedemos vía .vercel.app, tratarlo como Root Domain 
  // para que el superadmin pueda entrar al panel principal de creación de tenants.
  if (hostname.endsWith('.vercel.app')) {
    isRootDomain = true;
  }
  
  // Ruta original que el usuario pidió (ej: "/", "/reservar", "/admin")
  const path = url.pathname;

  let response: NextResponse;

  // 1. REESCRITURA PARA EL DOMINIO PRINCIPAL (Nuestra Landing Page del SaaS)
  if (isRootDomain) {
    const finalPath = path === '/' ? '/home' : `/home${path}`;
    console.log(`[PROXY] Rewriting ROOT DOMAIN request for ${hostname}${path} -> ${finalPath}`);
    response = NextResponse.rewrite(new URL(finalPath, req.url));
  } else {
    // 2. REESCRITURA PARA LOS INQUILINOS / TENANTS (Las páginas de los clientes)
    // Remover el rootDomain y .localhost del hostname para buscar el subdomain limpio en la BD localmente
    const cleanSubdomain = hostname
      .replace(`.${rootDomain}`, '')
      .replace('.localhost', '');
      
    const finalPath = path === '/' ? `/${cleanSubdomain}` : `/${cleanSubdomain}${path}`;
    console.log(`[PROXY] Rewriting TENANT request for ${hostname}${path} -> ${finalPath}`);
    response = NextResponse.rewrite(new URL(finalPath, req.url));
  }

  // 3. ACTUALIZAR SESIÓN DE SUPABASE
  // Esto refresca el token de auth si expiró, pasándole el request y el response de reescritura.
  return await updateSession(req, response);
}
