import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let redisClient = null;
const limiterCache = new Map();
let warnedMissingEnv = false;

function getRedis() {
  if (redisClient) return redisClient;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    if (!warnedMissingEnv) {
      console.warn(
        "[auth.ratelimit] UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN missing; rate limiting disabled (fail-open)."
      );
      warnedMissingEnv = true;
    }
    return null;
  }

  redisClient = new Redis({ url, token });
  return redisClient;
}

function getLimiter(key, limit, windowMs) {
  if (limiterCache.has(key)) return limiterCache.get(key);

  const redis = getRedis();
  if (!redis) return null;

  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, windowMs),
    prefix: `rl:auth:${key}`,
  });

  limiterCache.set(key, limiter);
  return limiter;
}

function getClientIp(req) {
  const headerNames = ["x-forwarded-for", "x-real-ip", "cf-connecting-ip", "x-client-ip"];
  for (const name of headerNames) {
    const value = req.headers.get(name);
    if (!value) continue;
    const first = value.split(",")[0].trim();
    if (first) return first;
  }
  return "unknown";
}

export async function checkAuthRateLimit(key, req, { limit, windowMs }) {
  const limiter = getLimiter(key, limit, windowMs);
  if (!limiter) return { allowed: true };

  const identifier = getClientIp(req);
  try {
    const result = await limiter.limit(identifier);
    return { allowed: result.success };
  } catch (err) {
    console.warn("[auth.ratelimit] Rate limit check failed; allowing request (fail-open).", err?.message || err);
    return { allowed: true };
  }
}
