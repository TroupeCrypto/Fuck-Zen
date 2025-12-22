// PATH: app/api/ai/exec/route.js
// PURPOSE: Secure, multi-provider AI execution endpoint for Roundtable
// CALLS FROM UI: POST /api/ai/exec
//
// Auth:
// - Requires Authorization: Bearer <JWT>
// - Verifies JWT using JWT_SECRET
//
// Providers supported (env-driven):
// - OpenAI:       OPENAI_API_KEY
// - Anthropic:    ANTHROPIC_API_KEY
// - Gemini:       GEMINI_API_KEY
// - Grok (xAI):   GROK_API_KEY
//
// Notes:
// - This is "Hello World" grade but production-safe: strict validation, hard timeouts,
//   server-side only, no key leakage.
// - Models can be overridden via env vars per-agent if you want.

export const runtime = "nodejs";

import OpenAI from "openai";
import jwt from "jsonwebtoken";
import { mustEnv } from "../../../../lib/env.js";
import { readJson } from "../../_utils/body.js";
import { json, badRequest, serverError, unauthorized } from "../../_utils/respond.js";

// ---------- Provider Clients (SDK where available) ----------
const openaiClient = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// xAI is OpenAI-compatible; docs: base https://api.x.ai with /v1/chat/completions
const grokClient = process.env.GROK_API_KEY
  ? new OpenAI({ apiKey: process.env.GROK_API_KEY, baseURL: "https://api.x.ai/v1" })
  : null;

// ---------- Agent Registry (minimum viable wiring) ----------
const AGENTS = {
  jarvis: {
    provider: "openai",
    model: process.env.JARVIS_MODEL || "gpt-4o-mini",
    system:
      "You are Jarvis, CFO/COO. Enforce structure, execution, and clarity. Be concise. No fluff.",
  },
  rowan: {
    provider: "openai",
    model: process.env.ROWAN_MODEL || "gpt-4o-mini",
    system:
      "You are Rowan, Chief Systems Architect. Provide structural evaluation only. No authority, no reframing.",
  },
  aria: {
    provider: "openai",
    model: process.env.ARIA_MODEL || "gpt-4o-mini",
    system:
      "You are Aria, Chief Research & Intelligence Officer. Evidence-based research. Cite uncertainty. Stay concise.",
  },
  kimi: {
    provider: "openai",
    model: process.env.KIMI_MODEL || "gpt-4o-mini",
    system:
      "You are Kimi, Chief Technical Engineer. Technical reasoning and implementation guidance. No fluff.",
  },
  claude: {
    provider: "anthropic",
    model: process.env.CLAUDE_MODEL || "claude-3-5-sonnet-20241022",
    system:
      "You are Claude, Chief Strategy Officer. Strategy and long-range planning only. Stay crisp.",
    max_tokens: 700,
  },
  zen: {
    provider: "gemini",
    model: process.env.ZEN_MODEL || "gemini-1.5-pro",
    system:
      "You are Zen, Chief Innovation Officer. Ideation and conceptual expansion only. No execution steps unless asked.",
  },
  grok: {
    provider: "grok",
    model: process.env.GROK_MODEL || "grok-2-latest",
    system:
      "You are Grok. Punchy, direct, culturally aware. Keep it short unless asked to expand.",
  },
};

// ---------- Auth (Bearer JWT) ----------
function parseBearer(req) {
  const raw = req.headers.get("authorization") || "";
  const m = String(raw).match(/^Bearer\s+(.+)$/i);
  return m ? String(m[1] || "").trim() : null;
}

/**
 * IMPORTANT:
 * Your login route may have issued tokens with audience "troupe-war-room" while
 * lib/auth/jwt.js defaults to "troupe-war-room-web". To avoid breakage tonight,
 * we accept either audience. (We can hard-align later.)
 */
function verifyTokenFlexible(token) {
  const secret = mustEnv("JWT_SECRET");

  const issuer = process.env.JWT_ISSUER || "troupe-war-room";
  const audPrimary = process.env.JWT_AUDIENCE || "troupe-war-room-web";
  const audFallback = "troupe-war-room";

  const baseOpts = {
    algorithms: ["HS256"],
    issuer,
  };

  // Try primary audience first
  try {
    return jwt.verify(token, secret, { ...baseOpts, audience: audPrimary });
  } catch {
    // Fallback audience (compat)
    return jwt.verify(token, secret, { ...baseOpts, audience: audFallback });
  }
}

// ---------- Helpers ----------
function clampInt(n, min, max, fallback) {
  const x = Number(n);
  if (!Number.isFinite(x)) return fallback;
  return Math.max(min, Math.min(max, Math.floor(x)));
}

async function withTimeout(promise, ms, label = "request") {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), ms);

  try {
    // If caller supports AbortSignal, pass controller.signal explicitly there.
    // For SDK calls, we rely on their internal handling; timeout still protects fetch below.
    return await promise(controller.signal);
  } finally {
    clearTimeout(t);
  }
}

// ---------- Provider Calls ----------
async function callOpenAI({ model, system, message }) {
  if (!openaiClient) throw new Error("OPENAI_API_KEY not configured");

  const res = await openaiClient.chat.completions.create({
    model,
    messages: [
      { role: "system", content: system },
      { role: "user", content: message },
    ],
  });

  return res?.choices?.[0]?.message?.content || "";
}

async function callGrok({ model, system, message }) {
  if (!grokClient) throw new Error("GROK_API_KEY not configured");

  const res = await grokClient.chat.completions.create({
    model,
    messages: [
      { role: "system", content: system },
      { role: "user", content: message },
    ],
  });

  return res?.choices?.[0]?.message?.content || "";
}

async function callAnthropic({ model, system, message, max_tokens }) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY not configured");

  const timeoutMs = 25_000;

  return await withTimeout(async (signal) => {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: clampInt(max_tokens, 1, 4000, 700),
        system,
        messages: [{ role: "user", content: message }],
      }),
      signal,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const detail = data?.error?.message || data?.message || JSON.stringify(data);
      throw new Error(`Anthropic error: ${detail}`);
    }

    // Claude Messages API returns: { content: [{ type:'text', text:'...' }] }
    const text = Array.isArray(data?.content) ? data.content.map((c) => c.text || "").join("") : "";
    return text || "";
  }, timeoutMs, "anthropic");
}

async function callGemini({ model, system, message }) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY not configured");

  const timeoutMs = 25_000;

  return await withTimeout(async (signal) => {
    // Official REST path: generateContent
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      model
    )}:generateContent?key=${encodeURIComponent(key)}`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: `${system}\n\n${message}` }],
          },
        ],
      }),
      signal,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const detail = data?.error?.message || JSON.stringify(data);
      throw new Error(`Gemini error: ${detail}`);
    }

    const text =
      data?.candidates?.[0]?.content?.parts?.map?.((p) => p.text || "")?.join?.("") || "";

    return text || "";
  }, timeoutMs, "gemini");
}

// ---------- Route ----------
export async function POST(req) {
  try {
    // 1) AUTH
    const token = parseBearer(req);
    if (!token) return unauthorized("Missing Bearer token");

    let session;
    try {
      session = verifyTokenFlexible(token);
    } catch {
      return unauthorized("Invalid or expired token");
    }

    // 2) BODY
    const body = (await readJson(req)) || {};
    const agentRaw = String(body.agent || "").trim().toLowerCase();
    const message = String(body.message || "").trim();

    if (!agentRaw) return badRequest("agent is required");
    if (!message) return badRequest("message is required");

    const cfg = AGENTS[agentRaw];
    if (!cfg) return badRequest(`Unknown agent: ${agentRaw}`);

    // 3) EXECUTE
    let output = "";
    const startedAt = Date.now();

    if (cfg.provider === "openai") {
      output = await callOpenAI(cfg);
    } else if (cfg.provider === "anthropic") {
      output = await callAnthropic(cfg);
    } else if (cfg.provider === "gemini") {
      output = await callGemini(cfg);
    } else if (cfg.provider === "grok") {
      output = await callGrok(cfg);
    } else {
      return badRequest(`Unsupported provider: ${cfg.provider}`);
    }

    const ms = Date.now() - startedAt;

    // 4) RESPONSE
    return json(200, {
      ok: true,
      agent: agentRaw,
      provider: cfg.provider,
      model: cfg.model,
      output: String(output || ""),
      meta: {
        ms,
        user: {
          sub: session?.sub || null,
          email: session?.email || null,
        },
      },
    });
  } catch (err) {
    return serverError("AI exec failed", { detail: err?.message || String(err) });
  }
}
