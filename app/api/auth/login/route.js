// app/api/auth/login/route.js
export const runtime = "nodejs";

import crypto from "crypto";
import { getPool } from "../../../../lib/db/pool.js";
import { checkAuthRateLimit } from "../../../../lib/auth/ratelimit.js";

function jsonResponse(status, body, extraHeaders = {}) {
  const headers = {
    "content-type": "application/json; charset=utf-8",
    ...extraHeaders,
  };
  return new Response(JSON.stringify(body), { status, headers });
}

function corsHeaders(req) {
  // If you want to restrict later, set CORS_ORIGINS="https://fuck-zen.vercel.app,https://hoppscotch.io"
  const allowed = (process.env.CORS_ORIGINS || "*")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const origin = req.headers.get("origin") || "";
  const allowOrigin = allowed.includes("*")
    ? "*"
    : allowed.includes(origin)
      ? origin
      : allowed[0] || "https://fuck-zen.vercel.app";

  return {
    "access-control-allow-origin": allowOrigin,
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type, authorization",
    "access-control-max-age": "86400",
    // Only set allow-credentials if you are NOT using "*"
    ...(allowOrigin === "*" ? {} : { "access-control-allow-credentials": "true" }),
  };
}

function base64url(input) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(String(input));
  return buf
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function signJwtHS256(payload, secret) {
  const header = { alg: "HS256", typ: "JWT" };
  const encodedHeader = base64url(JSON.stringify(header));
  const encodedPayload = base64url(JSON.stringify(payload));
  const data = `${encodedHeader}.${encodedPayload}`;

  const sig = crypto.createHmac("sha256", secret).update(data).digest();
  const encodedSig = base64url(sig);
  return `${data}.${encodedSig}`;
}

function parsePbkdf2(stored) {
  // pbkdf2$sha256$210000$<salt_b64>$<hash_b64>
  const parts = String(stored || "").split("$");
  if (parts.length !== 5) return null;
  const [kdf, algo, itersStr, saltB64, hashB64] = parts;
  if (kdf !== "pbkdf2") return null;
  if (algo !== "sha256") return null;

  const iters = Number(itersStr);
  if (!Number.isFinite(iters) || iters < 10000) return null;

  let salt, hash;
  try {
    salt = Buffer.from(saltB64, "base64");
    hash = Buffer.from(hashB64, "base64");
  } catch {
    return null;
  }
  if (!salt.length || !hash.length) return null;

  return { iters, salt, hash };
}

function timingSafeEqual(a, b) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

function verifyPassword(password, stored) {
  const parsed = parsePbkdf2(stored);
  if (!parsed) return false;

  const derived = crypto.pbkdf2Sync(
    Buffer.from(String(password), "utf8"),
    parsed.salt,
    parsed.iters,
    parsed.hash.length,
    "sha256"
  );

  return timingSafeEqual(derived, parsed.hash);
}

export async function OPTIONS(req) {
  return new Response(null, { status: 204, headers: corsHeaders(req) });
}

export async function GET(req) {
  // This makes Safari stop showing a blank page and clearly tells you what to do.
  return jsonResponse(
    405,
    { ok: false, message: "Use POST /api/auth/login with JSON { email, password }" },
    corsHeaders(req)
  );
}

export async function POST(req) {
  const cors = corsHeaders(req);

  try {
    const rate = await checkAuthRateLimit("login", req, { limit: 10, windowMs: 60_000 });
    if (!rate.allowed) {
      return jsonResponse(429, { ok: false, error: "Rate limited. Try again soon." }, cors);
    }

    const secret = process.env.JWT_SECRET;
    if (!secret || String(secret).trim().length < 16) {
      return jsonResponse(
        500,
        { ok: false, error: "JWT_SECRET is missing or too short in Vercel env." },
        cors
      );
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return jsonResponse(400, { ok: false, error: "Invalid JSON body." }, cors);
    }

    const email = String(body?.email || "").trim().toLowerCase();
    const password = String(body?.password || "");

    if (!email || !password) {
      return jsonResponse(400, { ok: false, error: "Email and password are required." }, cors);
    }

    const pool = getPool();
    const { rows } = await pool.query(
      `select id, email, display_name, role, password_hash, is_active
       from public.users
       where email = $1
       limit 1`,
      [email]
    );

    const user = rows[0];
    if (user && user.is_active === false) {
      return jsonResponse(403, { ok: false, error: "User disabled" }, cors);
    }
    // Do not leak which field failed.
    if (!user || !verifyPassword(password, user.password_hash)) {
      return jsonResponse(401, { ok: false, error: "Invalid credentials." }, cors);
    }

    const now = Math.floor(Date.now() / 1000);
    const ttl = Number(process.env.JWT_TTL_SECONDS || "604800"); // default 7 days
    const exp = now + (Number.isFinite(ttl) && ttl > 60 ? ttl : 604800);

    const token = signJwtHS256(
      {
        sub: String(user.id),
        email: String(user.email),
        role: String(user.role || "user"),
        iat: now,
        exp,
        iss: "fuck-zen",
      },
      secret
    );

    return jsonResponse(
      200,
      {
        ok: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          display_name: user.display_name || null,
          role: user.role || "user",
        },
      },
      cors
    );
  } catch (e) {
    return jsonResponse(500, { ok: false, error: "Server error.", detail: e?.message || String(e) }, cors);
  }
}
