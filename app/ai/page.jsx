// PATH: app/ai/page.jsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * DELUXE AI WAR ROOM (Persistent Conversations)
 * - Auth-aware (Bearer token)
 * - Multi-agent “room” support without new backend requirements:
 *   Each agent has its own persistent DB conversation; UI merges them into a single view.
 * - Conversation creation/listing uses:
 *     GET/POST  /api/ai/conversations
 * - Message send/list uses:
 *     GET/POST  /api/ai/conversations/:id/messages
 *
 * IMPORTANT:
 * - This UI stores your Bearer token locally (localStorage) for convenience.
 * - It also stores "agent room mappings" locally (localStorage) so your multi-agent room persists.
 */

const LS = {
  token: "fz_auth_token",
  room: "fz_ai_room_v1", // agent->conversationId mapping + activeRoomName
};

const AGENTS = [
  {
    id: "jarvis",
    name: "Jarvis",
    tagline: "Executive operator: ruthless clarity, build-first, delivery obsessed.",
    system: `[[SYSTEM]] You are Jarvis — Ziggy’s executive AI operator for Troupe Inc. You speak with calm authority, prioritize execution, provide step-by-step plans only when asked, and always return actionable outputs.`,
  },
  {
    id: "nova",
    name: "Nova",
    tagline: "Revenue hunter: crypto/NFT/collectibles arbitrage, asset acquisition, market scanning.",
    system: `[[SYSTEM]] You are Nova — revenue acquisition specialist for Troupe Inc. You prioritize legal opportunities, asset acquisition, and market intelligence. Be direct and ROI-driven.`,
  },
  {
    id: "zen",
    name: "Zen",
    tagline: "Design + product: vibe alignment, UX clarity, brand coherence.",
    system: `[[SYSTEM]] You are Zen — product + design lead for Troupe Inc. You propose UI/UX patterns, flows, and aesthetics aligned to a psychedelic futurist vibe. Keep it shippable.`,
  },
  {
    id: "gemini",
    name: "Gemini",
    tagline: "Big-context analyst: synthesis, deep research patterns, structured summaries.",
    system: `[[SYSTEM]] You are Gemini — large-context analyst. You synthesize, structure, and clarify complex threads. Prefer bulletproof reasoning and crisp summaries.`,
  },
  {
    id: "bb",
    name: "BB",
    tagline: "Systems architect: enterprise-grade, secure, scalable, no placeholders.",
    system: `[[SYSTEM]] You are BB — enterprise systems architect. You enforce production readiness, security best practices, and deterministic implementations. No placeholders, no vague steps.`,
  },
];

function clsx(...xs) {
  return xs.filter(Boolean).join(" ");
}

function safeJsonParse(s, fallback) {
  try {
    return JSON.parse(s);
  } catch {
    return fallback;
  }
}

function fmtTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString();
}

function redactToken(t) {
  if (!t) return "";
  if (t.length < 16) return t;
  return `${t.slice(0, 8)}…${t.slice(-6)}`;
}

async function apiFetch(path, { token, method = "GET", body } = {}) {
  const headers = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (body !== undefined) headers["Content-Type"] = "application/json";

  const res = await fetch(path, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { ok: false, error: "Non-JSON response", raw: text };
  }

  if (!res.ok) {
    const err = new Error(data?.error || data?.message || `HTTP ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

function mergeAgentThreads(agentThreads) {
  // agentThreads: [{ agentId, messages: [{role, content, created_at}] }]
  const out = [];
  for (const t of agentThreads) {
    for (const m of t.messages || []) {
      if (typeof m?.content === "string" && m.content.startsWith("[[SYSTEM]]")) continue; // hide priming
      out.push({
        agentId: t.agentId,
        role: m.role,
        content: m.content,
        created_at: m.created_at,
      });
    }
  }
  out.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  return out;
}

export default function AiWarRoomPage() {
  const [token, setToken] = useState("");
  const [tokenSaved, setTokenSaved] = useState(false);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginBusy, setLoginBusy] = useState(false);

  const [selectedAgents, setSelectedAgents] = useState(() => new Set(["jarvis"]));
  const [roomName, setRoomName] = useState("War Room");

  const [roomMap, setRoomMap] = useState(() => ({})); // { agentId: conversationId }
  const [conversations, setConversations] = useState([]); // from /api/ai/conversations
  const [loadingConvos, setLoadingConvos] = useState(false);

  const [activeView, setActiveView] = useState("room"); // "room" | "agent"
  const [activeAgent, setActiveAgent] = useState("jarvis");

  const [threads, setThreads] = useState({}); // { agentId: {loading, messages: []} }
  const [sendText, setSendText] = useState("");
  const [sending, setSending] = useState(false);
  const [statusLine, setStatusLine] = useState("");
  const bottomRef = useRef(null);

  const selectedAgentsArr = useMemo(() => Array.from(selectedAgents), [selectedAgents]);
  const selectedAgentObjs = useMemo(
    () => AGENTS.filter((a) => selectedAgents.has(a.id)),
    [selectedAgents]
  );

  const mergedRoom = useMemo(() => {
    const agentThreads = selectedAgentsArr.map((id) => ({
      agentId: id,
      messages: threads?.[id]?.messages || [],
    }));
    return mergeAgentThreads(agentThreads);
  }, [selectedAgentsArr, threads]);

  useEffect(() => {
    const t = localStorage.getItem(LS.token) || "";
    if (t) {
      setToken(t);
      setTokenSaved(true);
    }
    const saved = safeJsonParse(localStorage.getItem(LS.room) || "", null);
    if (saved?.roomName) setRoomName(saved.roomName);
    if (saved?.roomMap && typeof saved.roomMap === "object") setRoomMap(saved.roomMap);
    if (Array.isArray(saved?.selectedAgents) && saved.selectedAgents.length) {
      setSelectedAgents(new Set(saved.selectedAgents));
      setActiveAgent(saved.selectedAgents[0]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      LS.room,
      JSON.stringify({
        roomName,
        roomMap,
        selectedAgents: selectedAgentsArr,
      })
    );
  }, [roomName, roomMap, selectedAgentsArr]);

  useEffect(() => {
    // auto-scroll on message changes
    if (!bottomRef.current) return;
    bottomRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [mergedRoom.length, activeAgent, activeView]);

  async function handleLogin() {
    setStatusLine("");
    setLoginBusy(true);
    try {
      const data = await apiFetch("/api/auth/login", {
        method: "POST",
        body: { email: loginEmail, password: loginPass },
      });
      if (!data?.token) throw new Error("No token returned");
      localStorage.setItem(LS.token, data.token);
      setToken(data.token);
      setTokenSaved(true);
      setStatusLine("Logged in. Token saved locally.");
      setLoginPass("");
    } catch (e) {
      setStatusLine(`Login failed: ${e?.data?.error || e?.message || String(e)}`);
    } finally {
      setLoginBusy(false);
    }
  }

  function handleSaveToken() {
    if (!token.trim()) {
      setStatusLine("Token is empty.");
      return;
    }
    localStorage.setItem(LS.token, token.trim());
    setTokenSaved(true);
    setStatusLine(`Token saved: ${redactToken(token.trim())}`);
  }

  async function refreshConversations() {
    if (!token) {
      setStatusLine("Missing token. Log in or paste your Bearer token first.");
      return;
    }
    setLoadingConvos(true);
    setStatusLine("");
    try {
      const data = await apiFetch("/api/ai/conversations", { token, method: "GET" });
      setConversations(data?.conversations || []);
    } catch (e) {
      setStatusLine(`Failed to load conversations: ${e?.data?.error || e?.message || String(e)}`);
    } finally {
      setLoadingConvos(false);
    }
  }

  async function ensureAgentConversation(agentId) {
    // If agent already mapped, return it.
    const existing = roomMap?.[agentId];
    if (existing) return existing;

    // Otherwise create a new persistent conversation in DB.
    const agent = AGENTS.find((a) => a.id === agentId);
    const title = `${agent?.name || agentId} — ${roomName}`;
    const created = await apiFetch("/api/ai/conversations", {
      token,
      method: "POST",
      body: { title },
    });

    const convoId = created?.conversation?.id;
    if (!convoId) throw new Error("Conversation create failed (no id)");

    // Prime the agent personality (stored as a hidden [[SYSTEM]] message).
    const sys = agent?.system || `[[SYSTEM]] You are ${agentId}.`;
    try {
      await apiFetch(`/api/ai/conversations/${convoId}/messages`, {
        token,
        method: "POST",
        body: { message: sys },
      });
    } catch (e) {
      // If priming fails, still keep convo id; user can proceed.
      console.warn("Priming failed:", e);
    }

    setRoomMap((prev) => ({ ...prev, [agentId]: convoId }));
    return convoId;
  }

  async function loadAgentMessages(agentId) {
    if (!token) return;
    const convoId = roomMap?.[agentId];
    if (!convoId) return;

    setThreads((prev) => ({
      ...prev,
      [agentId]: { ...(prev[agentId] || {}), loading: true },
    }));

    try {
      const data = await apiFetch(`/api/ai/conversations/${convoId}/messages`, {
        token,
        method: "GET",
      });
      setThreads((prev) => ({
        ...prev,
        [agentId]: { loading: false, messages: data?.messages || [] },
      }));
    } catch (e) {
      setThreads((prev) => ({
        ...prev,
        [agentId]: { loading: false, messages: prev?.[agentId]?.messages || [], error: e },
      }));
      setStatusLine(`Failed to load ${agentId} messages: ${e?.data?.error || e?.message || String(e)}`);
    }
  }

  async function initRoom() {
    // Ensures convos exist for selected agents and loads threads.
    if (!token) {
      setStatusLine("Missing token. Log in or paste your Bearer token first.");
      return;
    }
    setStatusLine("Initializing room…");
    try {
      for (const agentId of selectedAgentsArr) {
        await ensureAgentConversation(agentId);
      }
      // Load threads after mapping
      for (const agentId of selectedAgentsArr) {
        await loadAgentMessages(agentId);
      }
      setStatusLine("Room ready.");
    } catch (e) {
      setStatusLine(`Init failed: ${e?.data?.error || e?.message || String(e)}`);
    }
  }

  function toggleAgent(agentId) {
    setSelectedAgents((prev) => {
      const next = new Set(prev);
      if (next.has(agentId)) next.delete(agentId);
      else next.add(agentId);
      if (next.size === 0) next.add("jarvis");
      return next;
    });
  }

  function openAgent(agentId) {
    setActiveAgent(agentId);
    setActiveView("agent");
    // Lazy-load messages if conversation exists
    setTimeout(() => loadAgentMessages(agentId), 0);
  }

  async function sendToAgents(message) {
    if (!token) {
      setStatusLine("Missing token. Log in or paste your Bearer token first.");
      return;
    }
    if (!message.trim()) return;

    setSending(true);
    setStatusLine("");
    try {
      // Ensure conversations exist
      const agentIds = selectedAgentsArr;
      const convoIds = {};
      for (const a of agentIds) {
        convoIds[a] = await ensureAgentConversation(a);
      }

      // Optimistic UI: append user msg into each agent thread immediately
      const nowIso = new Date().toISOString();
      setThreads((prev) => {
        const next = { ...prev };
        for (const a of agentIds) {
          const cur = next[a]?.messages || [];
          next[a] = {
            ...(next[a] || {}),
            messages: [
              ...cur,
              { role: "user", content: message, created_at: nowIso },
            ],
          };
        }
        return next;
      });

      // Send to each agent sequentially (deluxe stability; avoids burst limits)
      for (const a of agentIds) {
        const cid = convoIds[a];

        // Call backend (which also persists assistant reply)
        await apiFetch(`/api/ai/conversations/${cid}/messages`, {
          token,
          method: "POST",
          body: { message },
        });

        // Re-load that agent thread so UI matches DB state exactly
        await loadAgentMessages(a);
      }

      setStatusLine("Sent to selected AI.");
    } catch (e) {
      setStatusLine(`Send failed: ${e?.data?.error || e?.message || String(e)}`);
    } finally {
      setSending(false);
    }
  }

  const activeAgentObj = useMemo(
    () => AGENTS.find((a) => a.id === activeAgent) || AGENTS[0],
    [activeAgent]
  );

  const activeThread = threads?.[activeAgent]?.messages || [];

  return (
    <div className="min-h-screen w-full bg-black text-zinc-100">
      <div className="mx-auto max-w-[1400px] px-4 py-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">AI War Room</h1>
            <p className="mt-1 text-sm text-zinc-400">
              Persistent, auth-backed, multi-agent chat. No placeholders.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => refreshConversations()}
              className="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm hover:bg-zinc-900"
              disabled={loadingConvos}
              title="Loads your DB conversations list"
            >
              {loadingConvos ? "Loading…" : "Refresh Convos"}
            </button>
            <button
              onClick={() => initRoom()}
              className="rounded-md bg-white px-3 py-2 text-sm text-black hover:bg-zinc-200"
              disabled={sending}
              title="Creates (if needed) and primes selected agents, then loads threads"
            >
              Initialize Room
            </button>
          </div>
        </div>

        {/* Auth / Token Bar */}
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-4">
            <div className="text-sm font-medium">Token</div>
            <p className="mt-1 text-xs text-zinc-500">
              Paste your Bearer token here or log in below. Stored locally on this device.
            </p>
            <textarea
              value={token}
              onChange={(e) => {
                setToken(e.target.value);
                setTokenSaved(false);
              }}
              placeholder="Paste token here (starts with eyJ...)"
              className="mt-3 h-24 w-full resize-none rounded-md border border-zinc-800 bg-black p-2 text-xs text-zinc-100 outline-none focus:border-zinc-600"
            />
            <div className="mt-3 flex items-center justify-between gap-2">
              <button
                onClick={handleSaveToken}
                className="rounded-md border border-zinc-800 bg-black px-3 py-2 text-sm hover:bg-zinc-900"
              >
                Save Token
              </button>
              <div className="text-xs text-zinc-500">
                {tokenSaved && token ? `Saved: ${redactToken(token)}` : token ? "Not saved" : "No token"}
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-4">
            <div className="text-sm font-medium">Login (fast)</div>
            <p className="mt-1 text-xs text-zinc-500">
              Uses your existing <code className="text-zinc-300">/api/auth/login</code> and saves token.
            </p>
            <div className="mt-3 space-y-2">
              <input
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="Email"
                className="w-full rounded-md border border-zinc-800 bg-black px-3 py-2 text-sm outline-none focus:border-zinc-600"
              />
              <input
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                placeholder="Password"
                type="password"
                className="w-full rounded-md border border-zinc-800 bg-black px-3 py-2 text-sm outline-none focus:border-zinc-600"
              />
              <button
                onClick={handleLogin}
                disabled={loginBusy}
                className="w-full rounded-md bg-white px-3 py-2 text-sm text-black hover:bg-zinc-200 disabled:opacity-60"
              >
                {loginBusy ? "Logging in…" : "Login & Save Token"}
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-4">
            <div className="text-sm font-medium">Room Controls</div>
            <p className="mt-1 text-xs text-zinc-500">
              Select one AI for direct chat or multiple for a discussion. Each agent is persistent.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <input
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                className="w-full rounded-md border border-zinc-800 bg-black px-3 py-2 text-sm outline-none focus:border-zinc-600"
                placeholder="Room name"
              />
              <button
                onClick={() => {
                  setActiveView("room");
                }}
                className="rounded-md border border-zinc-800 bg-black px-3 py-2 text-sm hover:bg-zinc-900"
              >
                Room
              </button>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-2">
              {AGENTS.map((a) => {
                const on = selectedAgents.has(a.id);
                return (
                  <button
                    key={a.id}
                    onClick={() => toggleAgent(a.id)}
                    className={clsx(
                      "flex items-start justify-between gap-3 rounded-md border px-3 py-2 text-left",
                      on ? "border-white bg-white text-black" : "border-zinc-800 bg-black hover:bg-zinc-900"
                    )}
                    title={a.tagline}
                  >
                    <div>
                      <div className="text-sm font-medium">{a.name}</div>
                      <div className={clsx("text-xs", on ? "text-black/70" : "text-zinc-500")}>
                        {a.tagline}
                      </div>
                    </div>
                    <div className={clsx("text-xs font-semibold", on ? "text-black" : "text-zinc-400")}>
                      {on ? "ON" : "OFF"}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Layout */}
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-12">
          {/* Sidebar */}
          <div className="lg:col-span-4 rounded-lg border border-zinc-900 bg-zinc-950 p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Conversations (DB)</div>
              <button
                onClick={() => refreshConversations()}
                className="rounded-md border border-zinc-800 bg-black px-2 py-1 text-xs hover:bg-zinc-900"
              >
                Refresh
              </button>
            </div>
            <div className="mt-2 text-xs text-zinc-500">
              This is your raw DB conversation list (all titles). Your multi-agent room uses per-agent conversations.
            </div>

            <div className="mt-3 space-y-2 max-h-[340px] overflow-auto pr-1">
              {conversations?.length ? (
                conversations.map((c) => (
                  <div
                    key={c.id}
                    className="rounded-md border border-zinc-900 bg-black px-3 py-2"
                  >
                    <div className="text-sm font-medium">{c.title}</div>
                    <div className="mt-1 text-xs text-zinc-500">
                      Updated: {fmtTime(c.updated_at)}{" "}
                      <span className="text-zinc-700">•</span> ID:{" "}
                      <span className="text-zinc-400">{c.id}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-md border border-zinc-900 bg-black p-3 text-sm text-zinc-500">
                  No conversations loaded yet.
                </div>
              )}
            </div>

            <div className="mt-4 border-t border-zinc-900 pt-4">
              <div className="text-sm font-medium">Your Room Map</div>
              <div className="mt-2 space-y-2">
                {selectedAgentObjs.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between rounded-md border border-zinc-900 bg-black px-3 py-2"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium">{a.name}</div>
                      <div className="truncate text-xs text-zinc-500">
                        {roomMap?.[a.id] ? `Convo: ${roomMap[a.id]}` : "Not created yet (Initialize Room)"}
                      </div>
                    </div>
                    <button
                      onClick={() => openAgent(a.id)}
                      className="ml-3 rounded-md border border-zinc-800 bg-zinc-950 px-2 py-1 text-xs hover:bg-zinc-900"
                    >
                      Open
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Chat Panel */}
          <div className="lg:col-span-8 rounded-lg border border-zinc-900 bg-zinc-950 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-medium">
                  {activeView === "room" ? `Room: ${roomName}` : `Agent: ${activeAgentObj?.name || activeAgent}`}
                </div>
                <div className="mt-1 text-xs text-zinc-500">
                  {activeView === "room"
                    ? `Broadcasts your message to: ${selectedAgentObjs.map((a) => a.name).join(", ")}`
                    : activeAgentObj?.tagline}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveView("room")}
                  className={clsx(
                    "rounded-md px-3 py-2 text-sm",
                    activeView === "room"
                      ? "bg-white text-black"
                      : "border border-zinc-800 bg-black hover:bg-zinc-900"
                  )}
                >
                  Room View
                </button>
                <button
                  onClick={() => setActiveView("agent")}
                  className={clsx(
                    "rounded-md px-3 py-2 text-sm",
                    activeView === "agent"
                      ? "bg-white text-black"
                      : "border border-zinc-800 bg-black hover:bg-zinc-900"
                  )}
                >
                  Agent View
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="mt-4 h-[520px] overflow-auto rounded-md border border-zinc-900 bg-black p-4">
              {activeView === "room" ? (
                mergedRoom.length ? (
                  <div className="space-y-3">
                    {mergedRoom.map((m, idx) => {
                      const agent = AGENTS.find((a) => a.id === m.agentId);
                      const label = agent?.name || m.agentId;
                      const isUser = m.role === "user";
                      return (
                        <div
                          key={`${m.agentId}-${idx}-${m.created_at}`}
                          className={clsx(
                            "rounded-md border px-3 py-2",
                            isUser ? "border-zinc-800 bg-zinc-950" : "border-zinc-900 bg-black"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <div className="text-xs font-semibold text-zinc-400">
                              {isUser ? "You" : label}
                            </div>
                            <div className="text-[10px] text-zinc-600">{fmtTime(m.created_at)}</div>
                          </div>
                          <div className="mt-2 whitespace-pre-wrap text-sm text-zinc-100">
                            {m.content}
                          </div>
                        </div>
                      );
                    })}
                    <div ref={bottomRef} />
                  </div>
                ) : (
                  <div className="text-sm text-zinc-500">
                    No messages yet. Click <span className="text-zinc-200">Initialize Room</span>, then send a message.
                  </div>
                )
              ) : (
                <>
                  <div className="mb-3 rounded-md border border-zinc-900 bg-zinc-950 p-3">
                    <div className="text-sm font-medium">{activeAgentObj?.name}</div>
                    <div className="mt-1 text-xs text-zinc-500">{activeAgentObj?.tagline}</div>
                  </div>

                  {threads?.[activeAgent]?.loading ? (
                    <div className="text-sm text-zinc-500">Loading…</div>
                  ) : activeThread.length ? (
                    <div className="space-y-3">
                      {activeThread
                        .filter((m) => !(typeof m?.content === "string" && m.content.startsWith("[[SYSTEM]]")))
                        .map((m, idx) => (
                          <div
                            key={`${idx}-${m.created_at}`}
                            className={clsx(
                              "rounded-md border px-3 py-2",
                              m.role === "user" ? "border-zinc-800 bg-zinc-950" : "border-zinc-900 bg-black"
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <div className="text-xs font-semibold text-zinc-400">
                                {m.role === "user" ? "You" : activeAgentObj?.name}
                              </div>
                              <div className="text-[10px] text-zinc-600">{fmtTime(m.created_at)}</div>
                            </div>
                            <div className="mt-2 whitespace-pre-wrap text-sm text-zinc-100">
                              {m.content}
                            </div>
                          </div>
                        ))}
                      <div ref={bottomRef} />
                    </div>
                  ) : (
                    <div className="text-sm text-zinc-500">
                      No messages loaded. Click <span className="text-zinc-200">Initialize Room</span> first.
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Composer */}
            <div className="mt-4">
              <div className="flex items-end gap-2">
                <textarea
                  value={sendText}
                  onChange={(e) => setSendText(e.target.value)}
                  placeholder={
                    activeView === "room"
                      ? `Message the room (${selectedAgentObjs.map((a) => a.name).join(", ")})…`
                      : `Message ${activeAgentObj?.name || activeAgent}…`
                  }
                  className="h-24 w-full resize-none rounded-md border border-zinc-800 bg-black p-3 text-sm outline-none focus:border-zinc-600"
                />
                <button
                  onClick={async () => {
                    const msg = sendText.trim();
                    if (!msg) return;
                    setSendText("");
                    if (activeView === "room") {
                      await sendToAgents(msg);
                    } else {
                      // single agent send
                      setSelectedAgents((prev) => {
                        const next = new Set(prev);
                        next.add(activeAgent);
                        return next;
                      });
                      await sendToAgents(msg);
                    }
                  }}
                  disabled={sending}
                  className="rounded-md bg-white px-4 py-3 text-sm font-medium text-black hover:bg-zinc-200 disabled:opacity-60"
                >
                  {sending ? "Sending…" : "Send"}
                </button>
              </div>

              <div className="mt-3 flex items-center justify-between gap-3">
                <div className="text-xs text-zinc-500">
                  Tip: Room View broadcasts one message to multiple AI, storing each agent’s history persistently.
                </div>
                <div className="text-xs text-zinc-400">{statusLine}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer notes */}
        <div className="mt-6 text-xs text-zinc-600">
          <div>
            Multi-agent is implemented as <span className="text-zinc-300">one conversation per agent</span> (persisted in DB),
            merged into a single UI timeline. This avoids any additional backend orchestration and stays fully persistent.
          </div>
          <div className="mt-1">
            If you want a true “single DB conversation with multiple assistant identities,” we can add an optional
            <span className="text-zinc-300"> message metadata</span> column and a backend fan-out route next.
          </div>
        </div>
      </div>
    </div>
  );
}
