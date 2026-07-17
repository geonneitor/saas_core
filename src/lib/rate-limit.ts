/**
 * Rate Limiter — Dual mode: in-memory (default) + Redis (Upstash/Vercel KV).
 *
 * In-memory: No comparte state entre instancias Vercel Edge.
 * Redis:  Usa UPSTASH_REDIS_REST_URL / KV_URL si están configuradas.
 *
 * Estrategia:
 *   - Si env var KV_URL o UPSTASH_REDIS_REST_URL existe → Redis
 *   - Si no → in-memory Map (como antes)
 */

// =============================================================
// In-Memory implementation (fallback)
// =============================================================
interface RateLimitInfo {
  count: number;
  resetAt: number;
}

const rateLimitCache = new Map<string, RateLimitInfo>();

// =============================================================
// Redis implementation (Upstash / Vercel KV)
// =============================================================
type RedisClientShim = {
  zcount: (key: string, min: number, max: number) => Promise<number>;
  zadd: (key: string, score: number, member: string) => Promise<void>;
  zrange: (key: string, start: number, stop: number, opts?: { withScores?: boolean }) => Promise<any[]>;
  expire: (key: string, seconds: number) => Promise<void>;
};
let redisClient: RedisClientShim | null = null;

function getRedisClient() {
  if (redisClient) return redisClient;

  const url = process.env.KV_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) return null;

  // Lazy-init: REST-based client sin depender de @upstash/redis
  redisClient = {
    zcount: async (key: string, min: number, max: number) => {
      const res = await fetch(`${url}/zcount/${encodeURIComponent(key)}/${min}/${max}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const text = await res.text();
      return parseInt(text, 10) || 0;
    },
    zadd: async (key: string, score: number, member: string) => {
      await fetch(`${url}/zadd/${encodeURIComponent(key)}/${score}/${encodeURIComponent(member)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    zrange: async (key: string, start: number, stop: number, opts?: { withScores?: boolean }) => {
      const suffix = opts?.withScores ? 'WITHSCORES' : '';
      const res = await fetch(
        `${url}/zrange/${encodeURIComponent(key)}/${start}/${stop}${suffix ? `/${suffix}` : ''}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return res.json();
    },
    expire: async (key: string, seconds: number) => {
      await fetch(`${url}/expire/${encodeURIComponent(key)}/${seconds}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
  };

  return redisClient;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Rate limit por IP usando Redis (si configurado) o in-memory (fallback).
 *
 * @param ip - IP del cliente
 * @param maxRequests - Máximo de requests permitidos en la ventana
 * @param windowMs - Ventana de tiempo en milisegundos
 */
export async function rateLimit(
  ip: string,
  maxRequests: number = 10,
  windowMs: number = 60000
): Promise<RateLimitResult> {
  const redis = getRedisClient();

  if (redis) {
    return rateLimitRedis(redis, ip, maxRequests, windowMs);
  }

  return rateLimitInMemory(ip, maxRequests, windowMs);
}

async function rateLimitRedis(
  redis: NonNullable<typeof redisClient>,
  ip: string,
  maxRequests: number,
  windowMs: number
): Promise<RateLimitResult> {
  const key = `ratelimit:${ip}`;
  const now = Date.now();
  const windowStart = now - windowMs;

  try {
    const count = await redis.zcount(key, windowStart, now);

    if (count >= maxRequests) {
      // Obtener el timestamp del request más antiguo para calcular resetAt
      const oldest = await redis.zrange(key, 0, 0, { withScores: true });
      // zrange WITHSCORES returns [member1, score1, member2, score2, ...]
      const scores = Array.isArray(oldest) ? oldest : [];
      const oldestScore = scores.length >= 2 ? Number(scores[1]) || now : now;

      return {
        success: false,
        remaining: 0,
        resetAt: oldestScore + windowMs,
      };
    }

    // Agregar request actual con timestamp como score
    const member = `${now}-${crypto.randomUUID?.() || Math.random().toString(36).slice(2)}`;
    await redis.zadd(key, now, member);
    await redis.expire(key, Math.ceil(windowMs / 1000));

    return {
      success: true,
      remaining: maxRequests - count - 1,
      resetAt: now + windowMs,
    };
  } catch (error) {
    console.warn('[RateLimit] Redis error, fallback a in-memory:', error);
    return rateLimitInMemory(ip, maxRequests, windowMs);
  }
}

async function rateLimitInMemory(
  ip: string,
  maxRequests: number,
  windowMs: number
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
