// PATH: app/api/ai/conversations/[id]/messages/route.js
export const runtime = "nodejs";

import { requireAuth } from "../../../../../lib/auth/requireAuth.js";
import { getPool } from "../../../../../lib/db/pool.js";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

/**
 * GET /api/ai/conversations/:id/messages
 * Lists messages in a conversation
 */
export async function GET(req, { params }) {
  const auth = await requireAuth(req);
  if (!auth?.ok) return json(401, { ok: false, error: "Unauthorized" });

  const conversationId = params.id;
  const userId = auth.session.user_id;

  const pool = getPool();

  // Ensure conversation belongs to user
  const convo = await pool.query(
    `select id from ai_conversations where id=$1 and user_id=$2`,
    [conversationId, userId]
  );
  if (!convo.rowCount) {
    return json(404, { ok: false, error: "Conversation not found" });
  }

  const { rows } = await pool.query(
    `
    select role, content, created_at
    from ai_messages
    where conversation_id=$1
    order by created_at asc
    `,
    [conversationId]
  );

  return json(200, { ok: true, messages: rows });
}

/**
 * POST /api/ai/conversations/:id/messages
 * Body: { message: string }
 */
export async function POST(req, { params }) {
  const auth = await requireAuth(req);
  if (!auth?.ok) return json(401, { ok: false, error: "Unauthorized" });

  const conversationId = params.id;
  const userId = auth.session.user_id;

  const body = await req.json();
  const message = String(body?.message || "").trim();
  if (!message) {
    return json(400, { ok: false, error: "Message required" });
  }

  const pool = getPool();

  // Ownership check
  const convo = await pool.query(
    `select id from ai_conversations where id=$1 and user_id=$2`,
    [conversationId, userId]
  );
  if (!convo.rowCount) {
    return json(404, { ok: false, error: "Conversation not found" });
  }

  // Store user message
  await pool.query(
    `
    insert into ai_messages (conversation_id, role, content)
    values ($1, 'user', $2)
    `,
    [conversationId, message]
  );

  // Load history for AI
  const history = await pool.query(
    `
    select role, content
    from ai_messages
    where conversation_id=$1
    order by created_at asc
    `,
    [conversationId]
  );

  // Call real AI
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: history.rows.map(r => ({
      role: r.role,
      content: r.content,
    })),
  });

  const reply = completion.choices[0].message.content;

  // Store assistant reply
  await pool.query(
    `
    insert into ai_messages (conversation_id, role, content)
    values ($1, 'assistant', $2)
    `,
    [conversationId, reply]
  );

  return json(200, {
    ok: true,
    reply,
  });
}
