import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Construye una URL absoluta para la app, detectando automáticamente
 * el protocolo (http para localhost, https para producción).
 * Útil para magic link redirects, callbacks, y URLs absolutas multi-dominio.
 *
 * @param path - Ruta opcional (ej: '/auth/callback')
 * @param subdomain - Subdominio opcional para URLs multi-tenant (ej: 'barberia')
 */
export function getAppUrl(path: string = '', subdomain?: string): string {
  const domain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000';
  const host = subdomain ? `${subdomain}.${domain}` : domain;
  // localhost o IP local → http ; cualquier otro dominio → https
  const isLocal = domain === 'localhost' || domain.startsWith('localhost:') || domain.startsWith('127.');
  const protocol = isLocal ? 'http' : 'https';
  return `${protocol}://${host}${path}`;
}
