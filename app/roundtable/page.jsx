// PATH: app/roundtable/page.jsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * ROUND TABLE (JOINT INTERFACE)
 * Goal: Green lights + hello worlds for every employee tonight.
 *
 * This page:
 * - Auth: uses existing /api/auth/login and stores Bearer token locally
 * - Calls: POST /api/ai/exec (we will add this route next)
 * - Provides: agent selector + prompt + output + one-click Hello World tests
 */

const LS = {
  token: "troupe_auth_token",
};

const EMPLOYEES = [
  {
    id: "jarvis",
    name: "Jarvis",
    lane: "CFO/COO • Execution + enforcement",
    hello: "Return exactly: JARVIS_OK",
  },
  {
    id: "rowan",
    name: "Rowan",
    lane: "Systems Architect • Structure only",
    hello: "Return exactly: ROWAN_OK",
  },
  {
    id: "claude",
    name: "Claude",
    lane: "Strategy • Long-range reasoning",
    hello: "Return exactly: CLAUDE_OK",
  },
  {
    id: "zen",
    name: "Zen",
    lane: "Innovation • Ideation + product concepts",
    hello: "Return exactly: ZEN_OK",
  },
  {
    id: "aria",
    name: "Aria",
    lane: "Research • Intel + evidence",
    hello: "Return exactly: ARIA_OK",
  },
  {
    id: "kimi",
    name: "Kimi",
    lane: "Engineering • Technical logic",
    hello: "Return exactly: KIMI_OK",
  },
  {
    id: "grok",
    name: "Grok",
    lane: "Social + culture scanning • Punchy output",
    hello: "Return exactly: GROK_OK",
  },
];

function clsx(...xs) {
  return xs.filter(Boolean).join(" ");
}

function redactToken(t) {
  const s = String(t || "");
  if (!s) return "";
  if (s.length <= 18) return s;
  return `${s.slice(0, 10)}…${s.slice(-8)}`;
}

async function fetchJson(url, { method = "GET", token, body, timeoutMs = 20000 } = {}) {
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

export default function RoundtablePage() {
  const [token, setToken] = useState("");
  const [tokenSaved, setTokenSaved] = useState(false);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginBusy, setLoginBusy] = useState(false);

  const [agent, setAgent] = useState("jarvis");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const [statusLine, setStatusLine] = useState("");
  const [output, setOutput] = useState("");
  const [meta, setMeta] = useState(null);

  const bottomRef = useRef(null);

  const active = useMemo(() => EMPLOYEES.find((e) => e.id === agent) || EMPLOYEES[0], [agent]);

  useEffect(() => {
    const t = localStorage.getItem(LS.token) || "";
    if (t) {
      setToken(t);
      setTokenSaved(true);
      setStatusLine(`Token loaded: ${redactToken(t)}`);
    } else {
      setStatusLine("No token yet. Login to enable protected calls.");
    }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [output]);

  async function doLogin(e) {
    e?.preventDefault?.();
    setLoginBusy(true);
    setStatusLine("Logging in…");
    setOutput("");
    setMeta(null);

    try {
      const { data } = await fetchJson("/api/auth/login", {
        method: "POST",
        body: { email: loginEmail, password: loginPass },
        timeoutMs: 15000,
      });

      if (!data?.ok || !data?.token) {
        throw new Error(data?.error || "Login failed");
      }

      localStorage.setItem(LS.token, data.token);
      setToken(data.token);
      setTokenSaved(true);
      setStatusLine(`Login OK. Token saved: ${redactToken(data.token)}`);
    } catch (err) {
      setStatusLine(`Login failed: ${err?.message || String(err)}`);
    } finally {
      setLoginBusy(false);
    }
  }

  function logout() {
    localStorage.removeItem(LS.token);
    setToken("");
    setTokenSaved(false);
    setStatusLine("Logged out. Token cleared.");
  }

  async function sendExec(customMessage) {
    const msg = String(customMessage ?? message ?? "").trim();
    if (!msg) {
      setStatusLine("Type a message first.");
      return;
    }

    setSending(true);
    setStatusLine(`Sending to ${active.name}…`);
    setOutput("");
    setMeta(null);

    try {
      const { data } = await fetchJson("/api/ai/exec", {
        method: "POST",
        token: token || undefined,
        body: { agent, message: msg },
        timeoutMs: 30000,
      });

      const out =
        data?.output ??
        data?.reply ??
        data?.text ??
        (typeof data === "string" ? data : JSON.stringify(data, null, 2));

      setOutput(String(out || ""));
      setMeta(data?.meta || data || null);
      setStatusLine(`OK: ${active.name} responded.`);
    } catch (err) {
      const detail = err?.data ? JSON.stringify(err.data, null, 2) : "";
      setStatusLine(`ERROR: ${err?.message || String(err)}`);
      setOutput(detail || err?.raw || "");
      setMeta(err?.data || null);
    } finally {
      setSending(false);
    }
  }

  function helloWorld() {
    const hello = active?.hello || "Return OK";
    setMessage(hello);
    sendExec(hello);
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Roundtable</h1>
            <p className="mt-1 text-sm text-zinc-400">
              Joint interface for all employees. Green lights only. No loops.
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="text-xs text-zinc-400">
              Token:{" "}
              <span className={clsx("font-mono", token ? "text-emerald-400" : "text-zinc-500")}>
                {token ? redactToken(token) : "NONE"}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setStatusLine("Ready.")}
                className="rounded bg-zinc-800 px-3 py-2 text-xs hover:bg-zinc-700"
              >
                Clear Status
              </button>
              <button
                onClick={logout}
                className="rounded bg-zinc-900 px-3 py-2 text-xs hover:bg-zinc-800"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="mt-5 rounded border border-zinc-800 bg-zinc-950 p-3 text-sm">
          <div className="text-zinc-300">{statusLine}</div>
        </div>

        {/* Auth */}
        <div className="mt-6 rounded border border-zinc-800 bg-zinc-950 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Auth</div>
              <div className="text-xs text-zinc-400">
                Uses <span className="font-mono">POST /api/auth/login</span> and stores Bearer token locally.
              </div>
            </div>
            <div
              className={clsx(
                "rounded px-2 py-1 text-xs",
                tokenSaved ? "bg-emerald-950 text-emerald-300" : "bg-zinc-900 text-zinc-400"
              )}
            >
              {tokenSaved ? "TOKEN SAVED" : "NO TOKEN"}
            </div>
          </div>

          <form onSubmit={doLogin} className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="md:col-span-1">
              <label className="mb-1 block text-xs text-zinc-400">Email</label>
              <input
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="AUTH_EMAIL"
                className="w-full rounded border border-zinc-800 bg-black px-3 py-2 text-sm outline-none focus:border-zinc-600"
              />
            </div>
            <div className="md:col-span-1">
              <label className="mb-1 block text-xs text-zinc-400">Password</label>
              <input
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                placeholder="AUTH_PASSWORD"
                type="password"
                className="w-full rounded border border-zinc-800 bg-black px-3 py-2 text-sm outline-none focus:border-zinc-600"
              />
            </div>
            <div className="md:col-span-1 flex items-end gap-2">
              <button
                disabled={loginBusy}
                type="submit"
                className={clsx(
                  "w-full rounded px-3 py-2 text-sm font-medium",
                  loginBusy ? "bg-zinc-800 text-zinc-500" : "bg-emerald-700 hover:bg-emerald-600"
                )}
              >
                {loginBusy ? "Logging in…" : "Login"}
              </button>
            </div>
          </form>
        </div>

        {/* Roundtable */}
        <div className="mt-6 rounded border border-zinc-800 bg-zinc-950 p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-sm font-medium">Employee</div>
              <div className="text-xs text-zinc-400">Select a lane. Send a message. Get output.</div>
            </div>

            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <select
                value={agent}
                onChange={(e) => setAgent(e.target.value)}
                className="rounded border border-zinc-800 bg-black px-3 py-2 text-sm outline-none focus:border-zinc-600"
              >
                {EMPLOYEES.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} — {e.lane}
                  </option>
                ))}
              </select>

              <button
                onClick={helloWorld}
                disabled={sending}
                className={clsx(
                  "rounded px-3 py-2 text-sm font-medium",
                  sending ? "bg-zinc-800 text-zinc-500" : "bg-zinc-800 hover:bg-zinc-700"
                )}
              >
                Hello World
              </button>
            </div>
          </div>

          <div className="mt-3 text-xs text-zinc-400">
            Active: <span className="text-zinc-200">{active.name}</span>{" "}
            <span className="text-zinc-600">•</span> <span>{active.lane}</span>
          </div>

          <div className="mt-4 grid gap-3">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message…"
              className="min-h-[120px] w-full rounded border border-zinc-800 bg-black px-3 py-2 text-sm outline-none focus:border-zinc-600"
            />

            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <button
                onClick={() => sendExec()}
                disabled={sending}
                className={clsx(
                  "rounded px-4 py-2 text-sm font-semibold",
                  sending ? "bg-zinc-800 text-zinc-500" : "bg-indigo-700 hover:bg-indigo-600"
                )}
              >
                {sending ? "Sending…" : "Send"}
              </button>

              <div className="text-xs text-zinc-500">
                Calls <span className="font-mono text-zinc-300">POST /api/ai/exec</span> with{" "}
                <span className="font-mono text-zinc-300">{`{ agent, message }`}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Output */}
        <div className="mt-6 rounded border border-zinc-800 bg-zinc-950 p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Output</div>
            <button
              onClick={() => {
                setOutput("");
                setMeta(null);
                setStatusLine("Output cleared.");
              }}
              className="rounded bg-zinc-900 px-3 py-1.5 text-xs hover:bg-zinc-800"
            >
              Clear
            </button>
          </div>

          <div className="mt-3 rounded border border-zinc-800 bg-black p-3">
            <pre className="whitespace-pre-wrap break-words text-sm leading-relaxed text-zinc-100">
              {output || "No output yet."}
            </pre>
            <div ref={bottomRef} />
          </div>

          {meta ? (
            <details className="mt-3 rounded border border-zinc-800 bg-zinc-900/30 p-3">
              <summary className="cursor-pointer text-xs text-zinc-300">Response meta</summary>
              <pre className="mt-2 whitespace-pre-wrap break-words text-xs text-zinc-200">
                {JSON.stringify(meta, null, 2)}
              </pre>
            </details>
          ) : null}
        </div>

        {/* Footer */}
        <div className="mt-8 text-xs text-zinc-600">
          Note: If you see an error for <span className="font-mono">/api/ai/exec</span>, that’s expected until we
          add the gateway route. Next file will implement it.
        </div>
      </div>
    </div>
  );
}
