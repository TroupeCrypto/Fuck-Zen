// PATH: app/ai/page.jsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * AI WAR ROOM (DELUXE + DEBUG-HARDENED)
 * - Persistent multi-agent rooms
 * - Auth via Bearer token
 * - Shows REAL errors (status + body)
 * - Request timeouts to prevent “buffer then nothing”
 */

const LS = {
  token: "fz_auth_token",
  room: "fz_ai_room_v1",
};

const AGENTS = [
  {
    id: "jarvis",
    name: "Jarvis",
    tagline: "Executive operator: clarity, execution, delivery.",
    system:
      "[[SYSTEM]] You are Jarvis — Ziggy’s executive AI operator for Troupe Inc. You speak with calm authority, prioritize execution, and return actionable outputs.",
  },
  {
    id: "nova",
    name: "Nova",
    tagline: "Revenue hunter: assets, arbitrage, opportunities.",
    system:
      "[[SYSTEM]] You are Nova — revenue acquisition specialist for Troupe Inc. Prioritize legal opportunities, asset acquisition, and ROI.",
  },
  {
    id: "zen",
    name: "Zen",
    tagline: "Product + design: UX, flow, vibe alignment.",
    system:
      "[[SYSTEM]] You are Zen — product + design lead for Troupe Inc. Propose shippable UI/UX aligned to a psychedelic futurist vibe.",
  },
  {
    id: "gemini",
    name: "Gemini",
    tagline: "Big-context analyst: synthesis and structure.",
    system:
      "[[SYSTEM]] You are Gemini — large-context analyst. Synthesize and structure complex threads with crisp summaries.",
  },
  {
    id: "bb",
    name: "BB",
    tagline: "Systems architect: enterprise-grade, no placeholders.",
    system:
      "[[SYSTEM]] You are BB — enterprise systems architect. Enforce production readiness, security, and deterministic implementations.",
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
  const s = String(t || "");
  if (!s) return "";
  if (s.length < 18) return s;
  return `${s.slice(0, 10)}…${s.slice(-8)}`;
}

async function fetchJson(url, { method = "GET", token, body, timeoutMs = 15000 } = {}) {
  const headers = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (body !== undefined) headers["Content-Type"] = "application/json";

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let res;
  let raw = "";
  try {
    res = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    raw = await res.text();
  } catch (e) {
    clearTimeout(timer);
    const msg =
      e?.name === "AbortError"
        ? `Request timed out after ${timeoutMs}ms`
        : `Network error: ${e?.message || String(e)}`;
    const err = new Error(msg);
    err.meta = { url, method };
    throw err;
  } finally {
    clearTimeout(timer);
  }

  let data = null;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    data = { ok: false, error: "Non-JSON response", raw };
  }

  if (!res.ok) {
    const err = new Error(data?.error || data?.message || `HTTP ${res.status}`);
    err.status = res.status;
    err.data = data;
    err.raw = raw;
    err.meta = { url, method };
    throw err;
  }

  return { status: res.status, data, raw };
}

function mergeAgentThreads(agentThreads) {
  const out = [];
  for (const t of agentThreads) {
    for (const m of t.messages || []) {
      if (typeof m?.content === "string" && m.content.startsWith("[[SYSTEM]]")) continue;
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

  const [loginEmail, setLoginEmail] = useState("ziggy+auth@troupeinc.com");
  const [loginPass, setLoginPass] = useState("");
  const [loginBusy, setLoginBusy] = useState(false);

  const [selectedAgents, setSelectedAgents] = useState(() => new Set(["jarvis"]));
  const [roomName, setRoomName] = useState("War Room");

  const [roomMap, setRoomMap] = useState(() => ({})); // { agentId: conversationId }
  const [conversations, setConversations] = useState([]);
  const [loadingConvos, setLoadingConvos] = useState(false);

  const [activeView, setActiveView] = useState("room"); // "room" | "agent"
  const [activeAgent, setActiveAgent] = useState("jarvis");

  const [threads, setThreads] = useState({});
  const [sendText, setSendText] = useState("");
  const [sending, setSending] = useState(false);

  // Single unified status box (prints real details)
  const [statusLine, setStatusLine] = useState("");

  const bottomRef = useRef(null);

  const selectedAgentsArr = useMemo(() => Array.from(selectedAgents), [selectedAgents]);
  const selectedAgentObjs = useMemo(() => AGENTS.filter((a) => selectedAgents.has(a.id)), [selectedAgents]);

  const mergedRoom = useMemo(() => {
    const agentThreads = selectedAgentsArr.map((id) => ({
      agentId: id,
      messages: threads?.[id]?.messages || [],
    }));
    return mergeAgentThreads(agentThreads);
  }, [selectedAgentsArr, threads]);

  const activeAgentObj = useMemo(
    () => AGENTS.find((a) => a.id === activeAgent) || AGENTS[0],
    [activeAgent]
  );
  const activeThread = threads?.[activeAgent]?.messages || [];

  useEffect(() => {
    const t = localStorage.getItem(LS.token) || "";
    if (t) {
      setToken(t);
      setTokenSaved(true);
      setStatusLine(`Token loaded from device: ${redactToken(t)}`);
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
    if (!bottomRef.current) return;
    bottomRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [mergedRoom.length, activeAgent, activeView]);

  function saveTokenLocal(nextToken) {
    const t = String(nextToken || "").trim();
    if (!t) return false;
    localStorage.setItem(LS.token, t);
    setToken(t);
    setTokenSaved(true);
    return true;
  }

  async function handleLogin() {
    setStatusLine("");
    if (!loginEmail.trim() || !loginPass) {
      setStatusLine("Login failed: missing email or password.");
      return;
    }

    setLoginBusy(true);
    try {
      const { data } = await fetchJson("/api/auth/login", {
        method: "POST",
        body: { email: loginEmail, password: loginPass },
        timeoutMs: 15000,
      });

      if (!data?.token) {
        setStatusLine(`Login failed: response missing token. Raw: ${JSON.stringify(data)}`);
        return;
      }

      saveTokenLocal(data.token);
      setLoginPass("");
      setStatusLine(`Logged in. Token saved locally: ${redactToken(data.token)}`);
    } catch (e) {
      const detail = e?.data ? JSON.stringify(e.data) : e?.raw ? String(e.raw) : "";
      setStatusLine(
        `Login failed: ${e?.message || String(e)}${e?.status ? ` (HTTP ${e.status})` : ""}${
          detail ? ` | ${detail}` : ""
        }`
      );
    } finally {
      setLoginBusy(false);
    }
  }

  async function testMe() {
    setStatusLine("");
    if (!token.trim()) {
      setStatusLine("Test failed: missing token. Log in or paste token then Save Token.");
      return;
    }
    try {
      const { data } = await fetchJson("/api/auth/me", {
        method: "GET",
        token: token.trim(),
        timeoutMs: 15000,
      });
      setStatusLine(`ME OK: ${JSON.stringify(data)}`);
    } catch (e) {
      const detail = e?.data ? JSON.stringify(e.data) : e?.raw ? String(e.raw) : "";
      setStatusLine(
        `ME failed: ${e?.message || String(e)}${e?.status ? ` (HTTP ${e.status})` : ""}${
          detail ? ` | ${detail}` : ""
        }`
      );
    }
  }

  function handleSaveToken() {
    if (!token.trim()) {
      setStatusLine("Token is empty.");
      return;
    }
    saveTokenLocal(token.trim());
    setStatusLine(`Token saved: ${redactToken(token.trim())}`);
  }

  async function refreshConversations() {
    setStatusLine("");
    if (!token.trim()) {
      setStatusLine("Missing token. Log in or paste your Bearer token first.");
      return;
    }
    setLoadingConvos(true);
    try {
      const { data } = await fetchJson("/api/ai/conversations", {
        method: "GET",
        token: token.trim(),
        timeoutMs: 15000,
      });
      setConversations(data?.conversations || []);
      setStatusLine(`Loaded ${data?.conversations?.length ?? 0} conversations.`);
    } catch (e) {
      const detail = e?.data ? JSON.stringify(e.data) : e?.raw ? String(e.raw) : "";
      setStatusLine(
        `Failed to load conversations: ${e?.message || String(e)}${e?.status ? ` (HTTP ${e.status})` : ""}${
          detail ? ` | ${detail}` : ""
        }`
      );
    } finally {
      setLoadingConvos(false);
    }
  }

  async function ensureAgentConversation(agentId) {
    const existing = roomMap?.[agentId];
    if (existing) return existing;

    const agent = AGENTS.find((a) => a.id === agentId);
    const title = `${agent?.name || agentId} — ${roomName}`;

    const { data: created } = await fetchJson("/api/ai/conversations", {
      token: token.trim(),
      method: "POST",
      body: { title },
      timeoutMs: 15000,
    });

    const convoId = created?.conversation?.id;
    if (!convoId) throw new Error("Conversation create failed (missing id)");

    // Prime system identity (stored; hidden from UI)
    const sys = agent?.system || `[[SYSTEM]] You are ${agentId}.`;
    try {
      await fetchJson(`/api/ai/conversations/${convoId}/messages`, {
        token: token.trim(),
        method: "POST",
        body: { message: sys },
        timeoutMs: 20000,
      });
    } catch {
      // Non-fatal: room can still function without priming.
    }

    setRoomMap((prev) => ({ ...prev, [agentId]: convoId }));
    return convoId;
  }

  async function loadAgentMessages(agentId) {
    const convoId = roomMap?.[agentId];
    if (!convoId) return;

    setThreads((prev) => ({
      ...prev,
      [agentId]: { ...(prev[agentId] || {}), loading: true },
    }));

    try {
      const { data } = await fetchJson(`/api/ai/conversations/${convoId}/messages`, {
        token: token.trim(),
        method: "GET",
        timeoutMs: 15000,
      });
      setThreads((prev) => ({
        ...prev,
        [agentId]: { loading: false, messages: data?.messages || [] },
      }));
    } catch (e) {
      setThreads((prev) => ({
        ...prev,
        [agentId]: { loading: false, messages: prev?.[agentId]?.messages || [] },
      }));
      const detail = e?.data ? JSON.stringify(e.data) : e?.raw ? String(e.raw) : "";
      setStatusLine(
        `Failed to load ${agentId} messages: ${e?.message || String(e)}${e?.status ? ` (HTTP ${e.status})` : ""}${
          detail ? ` | ${detail}` : ""
        }`
      );
    }
  }

  async function initRoom() {
    setStatusLine("");
    if (!token.trim()) {
      setStatusLine("Missing token. Log in first.");
      return;
    }
    setStatusLine("Initializing room…");
    try {
      for (const agentId of selectedAgentsArr) {
        await ensureAgentConversation(agentId);
      }
      for (const agentId of selectedAgentsArr) {
        await loadAgentMessages(agentId);
      }
      setStatusLine("Room ready.");
    } catch (e) {
      setStatusLine(`Init failed: ${e?.message || String(e)}`);
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
    setTimeout(() => loadAgentMessages(agentId), 0);
  }

  async function sendToAgents(message) {
    setStatusLine("");
    if (!token.trim()) {
      setStatusLine("Missing token. Log in first.");
      return;
    }
    if (!message.trim()) return;

    setSending(true);
    try {
      const agentIds = selectedAgentsArr;

      // Ensure convos exist
      const convoIds = {};
      for (const a of agentIds) convoIds[a] = await ensureAgentConversation(a);

      // Optimistic local append (user)
      const nowIso = new Date().toISOString();
      setThreads((prev) => {
        const next = { ...prev };
        for (const a of agentIds) {
          const cur = next[a]?.messages || [];
          next[a] = {
            ...(next[a] || {}),
            messages: [...cur, { role: "user", content: message, created_at: nowIso }],
          };
        }
        return next;
      });

      // Sequential send (stability > speed)
      for (const a of agentIds) {
        const cid = convoIds[a];
        await fetchJson(`/api/ai/conversations/${cid}/messages`, {
          token: token.trim(),
          method: "POST",
          body: { message },
          timeoutMs: 45000,
        });
        await loadAgentMessages(a);
      }

      setStatusLine("Sent to selected AI.");
    } catch (e) {
      const detail = e?.data ? JSON.stringify(e.data) : e?.raw ? String(e.raw) : "";
      setStatusLine(
        `Send failed: ${e?.message || String(e)}${e?.status ? ` (HTTP ${e.status})` : ""}${
          detail ? ` | ${detail}` : ""
        }`
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-black text-zinc-100">
      <div className="mx-auto max-w-[1400px] px-4 py-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">AI War Room</h1>
            <p className="mt-1 text-sm text-zinc-400">
              Persistent multi-agent chat with real error reporting (no silent buffering).
            </p>
          </div>
          <div className="text-xs text-zinc-500">
            Token: <span className="text-zinc-300">{token ? redactToken(token) : "none"}</span>{" "}
            {tokenSaved && token ? <span className="ml-2">(saved)</span> : null}
          </div>
        </div>

        {/* Auth / Token Bar */}
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-4">
            <div className="text-sm font-medium">Token</div>
            <p className="mt-1 text-xs text-zinc-500">
              Paste token or log in. Use <span className="text-zinc-300">Test /me</span> to confirm.
            </p>
            <textarea
              value={token}
              onChange={(e) => {
                setToken(e.target.value);
                setTokenSaved(false);
              }}
              placeholder="Paste token (eyJ...)"
              className="mt-3 h-24 w-full resize-none rounded-md border border-zinc-800 bg-black p-2 text-xs text-zinc-100 outline-none focus:border-zinc-600"
            />
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={handleSaveToken}
                className="rounded-md border border-zinc-800 bg-black px-3 py-2 text-sm hover:bg-zinc-900"
              >
                Save Token
              </button>
              <button
                onClick={testMe}
                className="rounded-md bg-white px-3 py-2 text-sm text-black hover:bg-zinc-200"
              >
                Test /api/auth/me
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-4">
            <div className="text-sm font-medium">Login (fast)</div>
            <p className="mt-1 text-xs text-zinc-500">
              Uses <span className="text-zinc-300">POST /api/auth/login</span> and saves token.
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
              Select AI and click <span className="text-zinc-300">Initialize Room</span>.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <input
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                className="w-full rounded-md border border-zinc-800 bg-black px-3 py-2 text-sm outline-none focus:border-zinc-600"
                placeholder="Room name"
              />
              <button
                onClick={() => setActiveView("room")}
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
                      <div className={clsx("text-xs", on ? "text-black/70" : "text-zinc-500")}>{a.tagline}</div>
                    </div>
                    <div className={clsx("text-xs font-semibold", on ? "text-black" : "text-zinc-400")}>
                      {on ? "ON" : "OFF"}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={initRoom}
                disabled={sending}
                className="w-full rounded-md bg-white px-3 py-2 text-sm text-black hover:bg-zinc-200 disabled:opacity-60"
              >
                Initialize Room
              </button>
              <button
                onClick={refreshConversations}
                disabled={loadingConvos}
                className="rounded-md border border-zinc-800 bg-black px-3 py-2 text-sm hover:bg-zinc-900"
              >
                {loadingConvos ? "Loading…" : "Refresh Convos"}
              </button>
            </div>
          </div>
        </div>

        {/* Status box */}
        {statusLine ? (
          <div className="mt-4 rounded-lg border border-zinc-800 bg-black p-3 text-xs text-zinc-200 whitespace-pre-wrap">
            {statusLine}
          </div>
        ) : null}

        {/* Main Layout */}
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-12">
          {/* Sidebar */}
          <div className="lg:col-span-4 rounded-lg border border-zinc-900 bg-zinc-950 p-4">
            <div className="text-sm font-medium">Conversations (DB)</div>
            <div className="mt-2 text-xs text-zinc-500">
              Raw DB list. Your multi-agent room maps 1 conversation per agent.
            </div>

            <div className="mt-3 space-y-2 max-h-[340px] overflow-auto pr-1">
              {conversations?.length ? (
                conversations.map((c) => (
                  <div key={c.id} className="rounded-md border border-zinc-900 bg-black px-3 py-2">
                    <div className="text-sm font-medium">{c.title}</div>
                    <div className="mt-1 text-xs text-zinc-500">
                      Updated: {fmtTime(c.updated_at)} • ID: <span className="text-zinc-400">{c.id}</span>
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
              <div className="text-sm font-medium">Room Map</div>
              <div className="mt-2 space-y-2">
                {selectedAgentObjs.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between rounded-md border border-zinc-900 bg-black px-3 py-2"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium">{a.name}</div>
                      <div className="truncate text-xs text-zinc-500">
                        {roomMap?.[a.id] ? `Convo: ${roomMap[a.id]}` : "Not created yet"}
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
                    ? `Broadcasts to: ${selectedAgentObjs.map((a) => a.name).join(", ")}`
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
                            <div className="text-xs font-semibold text-zinc-400">{isUser ? "You" : label}</div>
                            <div className="text-[10px] text-zinc-600">{fmtTime(m.created_at)}</div>
                          </div>
                          <div className="mt-2 whitespace-pre-wrap text-sm text-zinc-100">{m.content}</div>
                        </div>
                      );
                    })}
                    <div ref={bottomRef} />
                  </div>
                ) : (
                  <div className="text-sm text-zinc-500">No messages yet. Initialize Room, then send a message.</div>
                )
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
                        <div className="mt-2 whitespace-pre-wrap text-sm text-zinc-100">{m.content}</div>
                      </div>
                    ))}
                  <div ref={bottomRef} />
                </div>
              ) : (
                <div className="text-sm text-zinc-500">No messages loaded. Initialize Room first.</div>
              )}
            </div>

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
              <div className="mt-3 text-xs text-zinc-600">
                Multi-agent = one persistent DB conversation per agent, merged into one timeline.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
