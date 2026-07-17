/**
 * Token Balance Cache — Dual mode: in-memory (default) + Redis (opcional).
 *
 * Cachea ai_token_limit + ai_tokens_used del tenant para evitar
 * consultas repetidas a Supabase en cada request del asistente.
 *
 * TTL: 30s por defecto (el webhook de Stripe invalida instantáneamente).
 */

const CACHE_TTL_MS = 30_000; // 30 segundos

interface TokenBalance {
  limit: number;
  used: number;
  cachedAt: number;
}

// In-memory cache
const tokenCache = new Map<string, TokenBalance>();

// Redis client lazy-init
type TokenRedisShim = {
  get: (key: string) => Promise<any>;
  setex: (key: string, seconds: number, value: string) => Promise<void>;
  del: (key: string) => Promise<void>;
};
let redisClient: TokenRedisShim | null = null;

function getRedisClient() {
  if (redisClient) return redisClient;

  const url = process.env.KV_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) return null;

  redisClient = {
    get: async (key: string) => {
      const res = await fetch(`${url}/get/${encodeURIComponent(key)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const text = await res.text();
      if (!text || text === '$-1\r\n' || text.startsWith('$-1')) return null;
      try {
        return JSON.parse(text);
      } catch {
        return text;
      }
    },
    setex: async (key: string, seconds: number, value: string) => {
      await fetch(`${url}/setex/${encodeURIComponent(key)}/${seconds}/${encodeURIComponent(value)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    del: async (key: string) => {
      await fetch(`${url}/del/${encodeURIComponent(key)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
  };

  return redisClient;
}

/**
 * Obtiene el balance de tokens de un tenant, usando caché si está disponible.
 * Retorna `null` si no hay datos (tenant no encontrado).
 */
export async function getTokenBalance(
  tenantId: string
): Promise<{ limit: number; used: number } | null> {
  const cacheKey = `tokens:${tenantId}`;
  const redis = getRedisClient();

  // 1. Intentar Redis
  if (redis) {
    try {
      const cached = await redis.get(cacheKey);
      if (cached && typeof cached === 'object' && cached !== null) {
        const data = cached as Record<string, unknown>;
        if ('limit' in data && 'used' in data) {
          return { limit: Number(data.limit) || 0, used: Number(data.used) || 0 };
        }
      }
    } catch (err) {
      console.warn('[TokenCache] Redis read error, fallback in-memory:', err);
    }
  }

  // 2. Intentar in-memory
  const cached = tokenCache.get(cacheKey);
  if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
    return { limit: cached.limit, used: cached.used };
  }

  return null; // Miss — caller debe consultar DB
}

/**
 * Guarda el balance de tokens en ambas capas de caché.
 */
export async function setTokenBalance(
  tenantId: string,
  balance: { limit: number; used: number }
): Promise<void> {
  const cacheKey = `tokens:${tenantId}`;
  const ttlSeconds = Math.ceil(CACHE_TTL_MS / 1000);

  // In-memory
  tokenCache.set(cacheKey, { ...balance, cachedAt: Date.now() });

  // Redis (best-effort)
  const redis = getRedisClient();
  if (redis) {
    try {
      await redis.setex(cacheKey, ttlSeconds, JSON.stringify(balance));
    } catch (err) {
      console.warn('[TokenCache] Redis write error:', err);
    }
  }
}

/**
 * Invalida el caché de tokens (ej: después de compra en webhook de Stripe).
 */
export async function invalidateTokenCache(tenantId: string): Promise<void> {
  const cacheKey = `tokens:${tenantId}`;

  // In-memory
  tokenCache.delete(cacheKey);

  // Redis
  const redis = getRedisClient();
  if (redis) {
    try {
      await redis.del(cacheKey);
    } catch (err) {
      console.warn('[TokenCache] Redis del error:', err);
    }
  }
}
