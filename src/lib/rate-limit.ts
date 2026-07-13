/**
 * Rate Limiter in-memory (Edge-compatible).
 * Token bucket por IP. NO comparte state entre isolates en Vercel Edge,
 * pero bloquea ataques básicos de fuerza bruta y abuso automatizado.
 * Para state global, migrar a Upstash Redis (código preparado abajo).
 */

interface RateLimitInfo {
  count: number;
  resetAt: number;
}

const rateLimitCache = new Map<string, RateLimitInfo>();

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

export async function rateLimit(
  ip: string,
  maxRequests: number = 10,
  windowMs: number = 60000
): Promise<RateLimitResult> {
  const now = Date.now();
  const cached = rateLimitCache.get(ip);

  // Limpiar entrada expirada
  if (cached && now > cached.resetAt) {
    rateLimitCache.delete(ip);
  }

  const current = rateLimitCache.get(ip);
  if (!current) {
    const resetAt = now + windowMs;
    rateLimitCache.set(ip, { count: 1, resetAt });
    return { success: true, remaining: maxRequests - 1, resetAt };
  }

  if (current.count >= maxRequests) {
    return { success: false, remaining: 0, resetAt: current.resetAt };
  }

  current.count += 1;
  return { success: true, remaining: maxRequests - current.count, resetAt: current.resetAt };
}
