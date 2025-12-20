// PATH: app/api/ai/conversations/route.js
export const runtime = "nodejs";

import { requireAuth } from "../../../../lib/auth/requireAuth.js";
import { getPool } from "../../../../lib/db/pool.js";
import { checkAuthRateLimit } from "../../../../lib/auth/ratelimit.js";

function jsonResponse(status, body, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...extraHeaders,
    },
  });
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
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type, authorization",
    "access-control-max-age": "86400",
    ...(allowOrigin === "*" ? {} : { "access-control-allow-credentials": "true" }),
  };
}

function safeTitle(input) {
  const t = String(input || "").trim();
  if (!t) return "New Conversation";
  // Keep titles sane
  return t.length > 120 ? t.slice(0, 120) : t;
}

export async function OPTIONS(req) {
  return new Response(null, { status: 204, headers: corsHeaders(req) });
}

/**
 * GET /api/ai/conversations
 * Lists latest conversations for the authenticated user.
 */
export async function GET(req) {
  const cors = corsHeaders(req);

  const auth = await requireAuth(req);
  if (!auth?.ok) {
    return jsonResponse(401, { ok: false, error: auth?.error || "Unauthorized" }, cors);
  }

  // Light rate-limit to protect the DB (fail-open is handled in helper)
  const rate = await checkAuthRateLimit("ai_conversations_list", req, { limit: 60, windowMs: 60_000 });
  if (!rate.allowed) {
    return jsonResponse(429, { ok: false, error: "Rate limited. Try again soon." }, cors);
  }

  try {
    const userId = auth.session.user_id;

    const pool = getPool();
    const { rows } = await pool.query(
      `
      select
        id,
        title,
        created_at,
        updated_at,
        archived_at
      from public.ai_conversations
      where user_id = $1
      order by updated_at desc
      limit 50
      `,
      [userId]
    );

    return jsonResponse(200, { ok: true, conversations: rows }, cors);
  } catch (e) {
    return jsonResponse(
      500,
      { ok: false, error: "Server error.", detail: e?.message || String(e) },
      cors
    );
  }
}

/**
 * POST /api/ai/conversations
 * Creates a new conversation for the authenticated user.
 * Body: { title?: string }
 */
export async function POST(req) {
  const cors = corsHeaders(req);

  const auth = await requireAuth(req);
  if (!auth?.ok) {
    return jsonResponse(401, { ok: false, error: auth?.error || "Unauthorized" }, cors);
  }

  // Protect against spam conversation creation
  const rate = await checkAuthRateLimit("ai_conversations_create", req, { limit: 20, windowMs: 60_000 });
  if (!rate.allowed) {
    return jsonResponse(429, { ok: false, error: "Rate limited. Try again soon." }, cors);
  }

  let body = {};
  try {
    body = await req.json();
  } catch {
    // allow empty body
    body = {};
  }

  const title = safeTitle(body?.title);

  try {
    const userId = auth.session.user_id;

    const pool = getPool();
    const { rows } = await pool.query(
      `
      insert into public.ai_conversations (user_id, title)
      values ($1, $2)
      returning id, title, created_at, updated_at, archived_at
      `,
      [userId, title]
    );

    return jsonResponse(201, { ok: true, conversation: rows[0] }, cors);
  } catch (e) {
    return jsonResponse(
      500,
      { ok: false, error: "Server error.", detail: e?.message || String(e) },
      cors
    );
  }
}
