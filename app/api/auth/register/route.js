// app/api/auth/register/route.js
export const runtime = "nodejs";

import { hashPassword } from "../../../../lib/auth/users.js";
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
  const fallbackOrigin = allowed[0] || process.env.DEFAULT_CORS_ORIGIN || "https://fuck-zen.vercel.app";

  const allowOrigin = allowed.includes("*")
    ? "*"
    : allowed.includes(origin)
      ? origin
      : fallbackOrigin;

  return {
    "access-control-allow-origin": allowOrigin,
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type, authorization",
    "access-control-max-age": "86400",
    ...(allowOrigin === "*" ? {} : { "access-control-allow-credentials": "true" }),
  };
}

function normalizeEmail(raw) {
  return String(raw || "").trim().toLowerCase();
}

function normalizeDisplayName(raw) {
  if (raw === undefined || raw === null) return null;
  const val = String(raw).trim();
  return val.length ? val : null;
}

const EMAIL_RE = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
function isValidEmail(email) {
  return EMAIL_RE.test(email);
}

async function ensureUserRole(pool, userId) {
  try {
    const { rows: tables } = await pool.query(
      `select tablename
       from pg_tables
       where schemaname = 'public'
         and tablename in ('roles', 'user_roles')`
    );
    const names = new Set(tables.map((t) => t.tablename));
    if (!names.has("roles") || !names.has("user_roles")) return null;

    const roleInsert = await pool.query(
      `insert into public.roles (name) values ($1)
       on conflict do nothing
       returning id`,
      ["user"]
    );
    const roleId =
      roleInsert.rows[0]?.id ||
      (
        await pool.query(
          `select id
           from public.roles
           where name = $1
           limit 1`,
          ["user"]
        )
      ).rows[0]?.id;
    if (!roleId) return null;

    await pool.query(
      `insert into public.user_roles (user_id, role_id)
       select $1, $2
       where not exists (
         select 1 from public.user_roles where user_id = $1 and role_id = $2
       )`,
      [userId, roleId]
    );
    return "user";
  } catch (_) {
    return null;
  }
}

export async function OPTIONS(req) {
  return new Response(null, { status: 204, headers: corsHeaders(req) });
}

export async function GET(req) {
  return jsonResponse(
    405,
    { ok: false, message: "Use POST /api/auth/register with JSON { email, password, display_name? }" },
    corsHeaders(req)
  );
}

export async function POST(req) {
  const cors = corsHeaders(req);

  let body;
  try {
    body = await req.json();
  } catch {
    return jsonResponse(400, { ok: false, error: "Invalid JSON body." }, cors);
  }

  const email = normalizeEmail(body?.email);
  const password = String(body?.password || "");
  const displayName = normalizeDisplayName(body?.display_name);

  if (!email) {
    return jsonResponse(400, { ok: false, error: "Email is required." }, cors);
  }
  if (!isValidEmail(email)) {
    return jsonResponse(400, { ok: false, error: "Invalid email format." }, cors);
  }
  if (password.length < 8) {
    return jsonResponse(400, { ok: false, error: "Password must be at least 8 characters." }, cors);
  }

  try {
    const pool = getPool();
    let passwordHash;
    try {
      passwordHash = hashPassword(password);
    } catch {
      return jsonResponse(500, { ok: false, error: "Failed to hash password." }, cors);
    }

    const { rows } = await pool.query(
      `insert into public.users (email, password_hash, display_name)
       values ($1, $2, $3)
       returning id, email, display_name`,
      [email, passwordHash, displayName]
    );

    const user = rows[0];
    if (!user) {
      return jsonResponse(500, { ok: false, error: "Failed to create user." }, cors);
    }

    const role = (await ensureUserRole(pool, user.id)) || user.role || "user";

    return jsonResponse(
      201,
      {
        ok: true,
        user: {
          id: user.id,
          email: user.email,
          display_name: user.display_name || null,
          role,
        },
      },
      cors
    );
  } catch (e) {
    if (e?.code === "23505") {
      return jsonResponse(409, { ok: false, error: "Email already registered" }, cors);
    }
    return jsonResponse(500, { ok: false, error: "Server error." }, cors);
  }
}
