/**
 * Resuelve el tenantId desde el header `host` del request.
 *
 * Edge-runtime compatible (sin fs, sin node APIs).
 *
 * Casos:
 * - "salon.geo-dev.online"        → "salon"
 * - "salon.geo-dev.online:443"    → "salon"
 * - "hq.geo-dev.online"           → null  (reservado para super-admin)
 * - "geo-dev.online"              → null  (root)
 * - "www.geo-dev.online"          → null  (root)
 * - "localhost:3000"              → null  (dev root)
 *
 * Producción: el header `host` viene de la red (Vercel/Cloudflare), confiable.
 * Dev: con `curl -H "Host: ..."` se puede spoofear — solo relevant en testing local.
 */
export function resolveTenantFromHost(host: string | null): string | null {
  if (!host) return null;

  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000';

  // Quitar puerto si existe
  const cleanHost = host.split(':')[0].toLowerCase();

  // Match exacto contra root o www.root
  if (cleanHost === rootDomain || cleanHost === `www.${rootDomain}`) {
    return null;
  }

  // Subdominios reservados (no son tenants)
  if (cleanHost.startsWith('hq.') || cleanHost.startsWith('app.') || cleanHost.startsWith('admin.')) {
    return null;
  }

  // Debe ser `${sub}.${rootDomain}` — extraemos el sub
  const suffix = `.${rootDomain}`;
  if (!cleanHost.endsWith(suffix)) {
    return null;
  }

  const sub = cleanHost.slice(0, -suffix.length);
  if (!sub || sub.includes('.')) {
    // No permitir sub.sub.root (e.g. "foo.bar.geo-dev.online")
    return null;
  }

  return sub;
}

/**
 * Compara el tenantId del body del request contra el resuelto del host.
 * Si ambos existen y difieren → MISMATCH (potencial ataque).
 * Si solo uno existe → usa ese (host gana por seguridad).
 */
export function reconcileTenantId(
  hostTenant: string | null,
  bodyTenant: string | null | undefined
): { tenantId: string | null; mismatch: boolean } {
  if (hostTenant && bodyTenant && hostTenant !== bodyTenant) {
    return { tenantId: null, mismatch: true };
  }
  return {
    tenantId: hostTenant || bodyTenant || null,
    mismatch: false,
  };
}
