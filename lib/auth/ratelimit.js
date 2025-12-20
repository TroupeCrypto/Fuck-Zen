//// FILE: lib/auth/ratelimit.js
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

  try {
    // Upstash client can throw if env is malformed; must be fail-open.
    redisClient = new Redis({ url: String(url), token: String(token) });
    return redisClient;
  } catch (err) {
    console.warn(
      "[auth.ratelimit] Redis init failed; rate limiting disabled (fail-open).",
      err?.message || err
    );
    return null;
  }
}

function getLimiter(key, limit, windowMs) {
  if (limiterCache.has(key)) return limiterCache.get(key);

  const redis = getRedis();
  if (!redis) return null;

  try {
    const limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(limit, windowMs),
      prefix: `rl:auth:${key}`,
    });

    limiterCache.set(key, limiter);
    return limiter;
  } catch (err) {
    console.warn(
      "[auth.ratelimit] Ratelimit init failed; rate limiting disabled (fail-open).",
      err?.message || err
    );
    return null;
  }
}

function getClientIp(req) {
  const headerNames = ["x-forwarded-for", "x-real-ip", "cf-connecting-ip", "x-client-ip"];
  for (const name of headerNames) {
    let value = null;
    try {
      value = req.headers.get(name);
    } catch {
      value = null;
    }
    if (!value) continue;
    const first = String(value).split(",")[0].trim();
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
