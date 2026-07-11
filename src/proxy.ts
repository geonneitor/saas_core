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

export default async function proxy(req: NextRequest) {
  const url = req.nextUrl;

  // Obtenemos el hostname actual (ej: "mibarberia.localhost:3000" o "mibarberia.geo-dev.online")
  let hostname = req.headers.get('host') || '';

  // Limpiamos el puerto en local para extraer solo el dominio
  hostname = hostname.replace(/:\d+$/, '');

  // Nuestro dominio base definido en .env (ej. localhost o geo-dev.online)
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN?.replace(/:\d+$/, '') || 'localhost';

  // Ruta original que el usuario pidió (ej: "/", "/reservar", "/admin")
  const path = url.pathname;

  let response: NextResponse;
  let isAdminApp = false;
  let isSuperAdminApp = false;

  // 1. REESCRITURA PARA EL SUPER ADMIN PANEL (hq)
  if (hostname === `hq.${rootDomain}`) {
    isSuperAdminApp = true;
    let finalPath = path;
    if (!path.startsWith('/login') && !path.startsWith('/auth')) {
      finalPath = path === '/' ? '/hq' : `/hq${path}`;
    }
    console.log(`[PROXY] Rewriting SUPER ADMIN request for ${hostname}${path} -> ${finalPath}`);
    response = NextResponse.rewrite(new URL(finalPath, req.url));
  } 
  // 2. REESCRITURA PARA EL TENANT ADMIN PANEL (app.geo-dev.online)
  else if (hostname === `app.${rootDomain}`) {
    isAdminApp = true;
    let finalPath = path;
    if (!path.startsWith('/login') && !path.startsWith('/auth')) {
      finalPath = path === '/' ? '/console' : `/console${path}`;
    }
    console.log(`[PROXY] Rewriting TENANT ADMIN request for ${hostname}${path} -> ${finalPath}`);
    response = NextResponse.rewrite(new URL(finalPath, req.url));
  }
  // 3. REESCRITURA PARA LA LANDING PAGE PRINCIPAL
  else if (
    hostname === rootDomain || 
    hostname === `www.${rootDomain}` ||
    hostname.endsWith('.vercel.app') // Vercel direct links
  ) {
    // Es la app principal, no reescribimos nada fuera de lo normal
    const finalPath = path;
    console.log(`[PROXY] Rewriting MAIN LANDING request for ${hostname}${path} -> ${finalPath}`);
    response = NextResponse.rewrite(new URL(finalPath, req.url));
  } 
  // 4. REESCRITURA PARA LOS INQUILINOS / TENANTS (Las páginas de los clientes)
  else {
    // Extraemos el subdominio limpio. Ej: salondeunas.geo-dev.online -> salondeunas
    const cleanSubdomain = hostname
      .replace(`.${rootDomain}`, '')
      .replace('.localhost', '');
      
    const isCustomDomain = hostname !== rootDomain && hostname !== `www.${rootDomain}` && !hostname.endsWith('.vercel.app');
    const finalPath = path === '/' ? `/${cleanSubdomain}` : `/${cleanSubdomain}${path}`;
    
    // Create new URL and append existing search params
    const urlWithParams = new URL(finalPath, req.url);
    req.nextUrl.searchParams.forEach((value, key) => {
      urlWithParams.searchParams.set(key, value);
    });

    if (isCustomDomain) {
      urlWithParams.searchParams.set('custom_domain', 'true');
    }
    console.log(`[PROXY] Rewriting TENANT request for ${hostname}${path} -> ${urlWithParams.pathname}${urlWithParams.search}`);
    response = NextResponse.rewrite(urlWithParams);
  }

  // 5. ACTUALIZAR SESIÓN DE SUPABASE
  // Esto refresca el token de auth si expiró, pasándole el request y el response de reescritura.
  return await updateSession(req, response, { isAdminApp, isSuperAdminApp });
}
