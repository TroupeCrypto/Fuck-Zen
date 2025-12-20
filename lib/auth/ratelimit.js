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


//// FILE: lib/auth/requireAuth.js
import { verifyAccessToken } from "./jwt.js";

function parseBearer(req) {
  let raw;
  try {
    raw = req.headers.get("authorization");
  } catch (err) {
    raw = err?.message || String(err);
  }

  const headerValue =
    typeof raw === "string" ? raw : (raw?.message || String(raw || ""));

  const m = headerValue?.match?.(/^Bearer\s+(.+)$/i);
  return m ? String(m[1] || "").trim() : null;
}

export async function requireAuth(req) {
  const token = parseBearer(req);
  if (!token) return { ok: false, error: "Missing bearer token" };

  try {
    const decoded = await verifyAccessToken(token);
    return {
      ok: true,
      session: {
        user_id: decoded.sub,
        email: decoded.email || null,
        roles: Array.isArray(decoded.roles) ? decoded.roles : [],
      },
    };
  } catch {
    return { ok: false, error: "Invalid or expired token" };
  }
}

export function requireRole(session, requiredRole) {
  const roles = session?.roles || [];
  return roles.includes(requiredRole);
}


//// FILE: app/api/auth/me/route.js
// app/api/auth/me/route.js
export const runtime = "nodejs";

import crypto from "crypto";
import { getPool } from "../../../../lib/db/pool.js";

function jsonResponse(status, body, extraHeaders = {}) {
  const headers = {
    "content-type": "application/json; charset=utf-8",
    ...extraHeaders,
  };
  return new Response(JSON.stringify(body), { status, headers });
}

function corsHeaders(req) {
  const allowed = (process.env.CORS_ORIGINS || "*")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const origin = (() => {
    try {
      return req.headers.get("origin") || "";
    } catch {
      return "";
    }
  })();

  const allowOrigin = allowed.includes("*")
    ? "*"
    : allowed.includes(origin)
      ? origin
      : allowed[0] || "https://fuck-zen.vercel.app";

  return {
    "access-control-allow-origin": allowOrigin,
    "access-control-allow-methods": "GET,OPTIONS",
    "access-control-allow-headers": "content-type, authorization",
    "access-control-max-age": "86400",
    ...(allowOrigin === "*" ? {} : { "access-control-allow-credentials": "true" }),
  };
}

function base64urlToBuf(s) {
  const padded = String(s).replace(/-/g, "+").replace(/_/g, "/") + "===".slice((String(s).length + 3) % 4);
  return Buffer.from(padded, "base64");
}

function verifyJwtHS256(token, secret) {
  const parts = String(token || "").split(".");
  if (parts.length !== 3) return null;

  const [h, p, sig] = parts;
  const data = `${h}.${p}`;

  const expected = crypto.createHmac("sha256", secret).update(data).digest();
  const got = base64urlToBuf(sig);

  if (expected.length !== got.length || !crypto.timingSafeEqual(expected, got)) return null;

  let payload;
  try {
    payload = JSON.parse(base64urlToBuf(p).toString("utf8"));
  } catch {
    return null;
  }

  const now = Math.floor(Date.now() / 1000);
  if (payload?.exp && Number(payload.exp) < now) return { expired: true, payload };
  return { payload };
}

function getBearerToken(req) {
  let raw;
  try {
    raw = req.headers.get("authorization");
  } catch (err) {
    raw = err?.message || String(err);
  }

  const authValue =
    typeof raw === "string" ? raw : (raw?.message || String(raw || ""));

  const m = authValue?.match?.(/^Bearer\s+(.+)$/i);
  return m ? String(m[1] || "").trim() : "";
}

export async function OPTIONS(req) {
  return new Response(null, { status: 204, headers: corsHeaders(req) });
}

export async function GET(req) {
  const cors = corsHeaders(req);

  const secret = process.env.JWT_SECRET;
  if (!secret || String(secret).trim().length < 16) {
    return jsonResponse(500, { ok: false, error: "JWT_SECRET is missing or too short in Vercel env." }, cors);
  }

  const token = getBearerToken(req);
  if (!token) {
    return jsonResponse(401, { ok: false, error: "Missing Authorization: Bearer <token>" }, cors);
  }

  const verified = verifyJwtHS256(token, secret);
  if (!verified) {
    return jsonResponse(401, { ok: false, error: "Invalid token." }, cors);
  }
  if (verified.expired) {
    return jsonResponse(401, { ok: false, error: "Token expired." }, cors);
  }

  const { payload } = verified;
  const userId = String(payload?.sub || "");
  if (!userId) {
    return jsonResponse(401, { ok: false, error: "Invalid token payload." }, cors);
  }

  try {
    const pool = getPool();
    const { rows } = await pool.query(
      `select id, email, display_name, role, created_at, is_active
       from public.users
       where id = $1
       limit 1`,
      [userId]
    );

    const user = rows[0];
    if (!user) {
      return jsonResponse(401, { ok: false, error: "User not found." }, cors);
    }
    if (user.is_active === false) {
      return jsonResponse(403, { ok: false, error: "User disabled" }, cors);
    }

    return jsonResponse(
      200,
      {
        ok: true,
        user: {
          id: user.id,
          email: user.email,
          display_name: user.display_name || null,
          role: user.role || "user",
          created_at: user.created_at,
        },
      },
      cors
    );
  } catch (e) {
    return jsonResponse(500, { ok: false, error: "Server error.", detail: e?.message || String(e) }, cors);
  }
}
