// PATH: app/api/ai/conversations/[id]/messages/route.js
export const runtime = "nodejs";

import OpenAI from "openai";
import { json, badRequest, serverError } from "../../../../../../app/api/_utils/respond.js";
import { requireAuth } from "../../../../../../lib/auth/requireAuth.js";
import { getPool } from "../../../../../../lib/db/pool.js";

function pickModel() {
  return process.env.OPENAI_MODEL || "gpt-4.1-mini";
}

async function ensureOwnedConversation(pool, conversationId, userId) {
  const { rowCount } = await pool.query(
    `select id from public.ai_conversations where id = $1 and user_id = $2`,
    [conversationId, userId]
  );
  return rowCount > 0;
}

/**
 * GET /api/ai/conversations/:id/messages
 * Lists messages in a conversation (auth + ownership enforced)
 */
export async function GET(req, { params }) {
  const auth = await requireAuth(req);
  if (!auth?.ok) return json(401, { ok: false, error: auth?.error || "Unauthorized" });

  const conversationId = params?.id;
  if (!conversationId) return badRequest("Missing conversation id");

  try {
    const pool = getPool();
    const userId = auth.session.user_id;

    const owned = await ensureOwnedConversation(pool, conversationId, userId);
    if (!owned) return json(404, { ok: false, error: "Conversation not found" });

    const { rows } = await pool.query(
      `
      select role, content, created_at
      from public.ai_messages
      where conversation_id = $1
      order by created_at asc
      `,
      [conversationId]
    );

    return json(200, { ok: true, messages: rows });
  } catch (e) {
    return serverError("Server error.", { detail: e?.message || String(e) });
  }
}

/**
 * POST /api/ai/conversations/:id/messages
 * Body: { message: string }
 *
 * Stores the user message, calls OpenAI, stores assistant reply, returns reply.
 */
export async function POST(req, { params }) {
  const auth = await requireAuth(req);
  if (!auth?.ok) return json(401, { ok: false, error: auth?.error || "Unauthorized" });

  const conversationId = params?.id;
  if (!conversationId) return badRequest("Missing conversation id");

  let body;
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const message = String(body?.message || "").trim();
  if (!message) return badRequest("Message required");

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || !String(apiKey).trim()) {
    return serverError("OPENAI_API_KEY is not configured");
  }

  try {
    const pool = getPool();
    const userId = auth.session.user_id;

    const owned = await ensureOwnedConversation(pool, conversationId, userId);
    if (!owned) return json(404, { ok: false, error: "Conversation not found" });

    // Store user message
    await pool.query(
      `
      insert into public.ai_messages (conversation_id, role, content)
      values ($1, 'user', $2)
      `,
      [conversationId, message]
    );

    // Load conversation history (bounded)
    const history = await pool.query(
      `
      select role, content
      from public.ai_messages
      where conversation_id = $1
      order by created_at asc
      limit 60
      `,
      [conversationId]
    );

    const client = new OpenAI({ apiKey });

    // Use Responses API (consistent with /api/ai/ping)
    const response = await client.responses.create({
      model: pickModel(),
      input: history.rows.map((r) => ({
        role: r.role,
        content: [{ type: "input_text", text: r.content }],
      })),
      max_output_tokens: 800,
    });

    const reply =
      response.output_text ||
      response.output?.[0]?.content?.[0]?.text ||
      "";

    // Store assistant reply
    await pool.query(
      `
      insert into public.ai_messages (conversation_id, role, content)
      values ($1, 'assistant', $2)
      `,
      [conversationId, reply]
    );

    // Touch updated_at on conversation
    await pool.query(
      `update public.ai_conversations set updated_at = now() where id = $1`,
      [conversationId]
    );

    return json(200, { ok: true, reply });
  } catch (e) {
    return serverError("Server error.", { detail: e?.message || String(e) });
  }
}
