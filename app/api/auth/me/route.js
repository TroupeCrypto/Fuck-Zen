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

  const origin = req.headers.get("origin") || "";
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
  const auth = req.headers.get("authorization");
  const authValue = typeof auth === "string" ? auth : auth?.message || String(auth || "");
  const m = authValue.match(/^Bearer\s+(.+)$/i);
  return m ? m[1].trim() : "";
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
        token: {
          iat: payload?.iat || null,
          exp: payload?.exp || null,
          role: payload?.role || null,
        },
      },
      cors
    );
  } catch (e) {
    return jsonResponse(500, { ok: false, error: "Server error.", detail: e?.message || String(e) }, cors);
  }
}
