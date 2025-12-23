// PATH: app/roundtable/page.jsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

const AGENTS = [
  {
    id: "jarvis",
    name: "Jarvis",
    role: "CFO/COO • Execution & clarity",
    provider: "OpenAI",
    model: "gpt-4o-mini",
    hello: "Return exactly: JARVIS_OK",
    tone: "from-emerald-500/70 to-emerald-300/40",
  },
  {
    id: "rowan",
    name: "Rowan",
    role: "Systems Architect • Structure only",
    provider: "OpenAI",
    model: "gpt-4o-mini",
    hello: "Return exactly: ROWAN_OK",
    tone: "from-cyan-500/70 to-cyan-300/40",
  },
  {
    id: "claude",
    name: "Claude",
    role: "Strategy • Long-range thinking",
    provider: "Anthropic",
    model: "claude-3-5-sonnet-20241022",
    hello: "Return exactly: CLAUDE_OK",
    tone: "from-amber-500/70 to-amber-300/40",
  },
  {
    id: "zen",
    name: "Zen",
    role: "Innovation • Concept sprints",
    provider: "Gemini",
    model: "gemini-1.5-pro",
    hello: "Return exactly: ZEN_OK",
    tone: "from-purple-500/70 to-purple-300/40",
  },
  {
    id: "aria",
    name: "Aria",
    role: "Research • Intel + evidence",
    provider: "OpenAI",
    model: "gpt-4o-mini",
    hello: "Return exactly: ARIA_OK",
    tone: "from-pink-500/70 to-pink-300/40",
  },
  {
    id: "kimi",
    name: "Kimi",
    role: "Engineering • Technical logic",
    provider: "OpenAI",
    model: "gpt-4o-mini",
    hello: "Return exactly: KIMI_OK",
    tone: "from-indigo-500/70 to-indigo-300/40",
  },
  {
    id: "grok",
    name: "Grok",
    role: "Culture radar • Punchy takes",
    provider: "Grok (xAI)",
    model: "grok-2-latest",
    hello: "Return exactly: GROK_OK",
    tone: "from-orange-500/70 to-orange-300/40",
  },
];

function clsx(...xs) {
  return xs.filter(Boolean).join(" ");
}

async function execAgent(agent, message) {
  const res = await fetch("/api/ai/exec", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ agent, message }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok || data?.ok === false) {
    const err = new Error(data?.error || data?.message || `HTTP ${res.status}`);
    err.data = data;
    throw err;
  }

  return data;
}

export default function RoundtablePage() {
  const [agent, setAgent] = useState("jarvis");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("Systems live. Choose an agent and fire.");
  const [sending, setSending] = useState(false);
  const [output, setOutput] = useState("");
  const [meta, setMeta] = useState(null);

  const feedRef = useRef(null);
  const active = useMemo(() => AGENTS.find((a) => a.id === agent) || AGENTS[0], [agent]);

  useEffect(() => {
    feedRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [output, meta]);

  async function fire(customMessage) {
    const msg = String(customMessage ?? message ?? "").trim();
    if (!msg) {
      setStatus("Type a prompt first.");
      return;
    }

    setSending(true);
    setStatus(`Dispatching to ${active.name}…`);
    setOutput("");
    const started = performance.now();

    try {
      const data = await execAgent(agent, msg);
      const latency = data?.meta?.ms ?? Math.round(performance.now() - started);

      setOutput(String(data?.output || ""));
      setMeta({
        ...data?.meta,
        provider: data?.provider,
        model: data?.model,
        latency,
      });
      setStatus(`Response from ${data?.agent || active.name} in ${latency}ms`);
    } catch (err) {
      const detail = err?.data ? JSON.stringify(err.data, null, 2) : err?.message || String(err);
      setOutput(detail);
      setMeta(null);
      setStatus(`Error: ${err?.message || "Request failed"}`);
    } finally {
      setSending(false);
    }
  }

  function hello(agentId) {
    const target = AGENTS.find((a) => a.id === agentId) || active;
    setAgent(agentId);
    const ping = target.hello || "Return OK";
    setMessage(ping);
    fire(ping);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-zinc-100">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Executive War Room</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">Roundtable Command</h1>
            <p className="mt-2 text-sm text-zinc-400">
              Live wiring from UI → API → LLM. Pick an agent, fire a prompt, watch the response roll in.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-200">
              ACTIVE AGENT • {active.name}
            </span>
            <span className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-xs text-zinc-300">
              {status}
            </span>
          </div>
        </header>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2 space-y-4">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4 shadow-xl shadow-emerald-500/10">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-sm font-semibold text-white">Active Agent</div>
                  <div className="text-xs text-zinc-400">{active.role}</div>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="rounded bg-zinc-900 px-3 py-1 text-zinc-300">
                    Provider: <span className="font-medium text-white">{meta?.provider || active.provider}</span>
                  </span>
                  <span className="rounded bg-zinc-900 px-3 py-1 text-zinc-300">
                    Model: <span className="font-medium text-white">{meta?.model || active.model}</span>
                  </span>
                  <span className="rounded bg-zinc-900 px-3 py-1 text-zinc-300">
                    Latency:{" "}
                    <span className="font-medium text-white">{meta?.latency ? `${meta.latency} ms` : "—"}</span>
                  </span>
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-[2fr,auto] md:items-start">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a decisive prompt for the council..."
                  className="min-h-[180px] w-full rounded-xl border border-zinc-800 bg-black/70 px-4 py-3 text-sm text-white outline-none ring-emerald-500/50 focus:border-emerald-500/50 focus:ring-2"
                />

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => fire()}
                    disabled={sending}
                    className={clsx(
                      "rounded-xl px-4 py-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-emerald-500/60",
                      sending
                        ? "bg-zinc-800 text-zinc-500"
                        : "bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-500"
                    )}
                  >
                    {sending ? "Routing..." : "Engage"}
                  </button>
                  <button
                    onClick={() => hello(agent)}
                    disabled={sending}
                    className={clsx(
                      "rounded-xl px-4 py-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-indigo-500/60",
                      sending
                        ? "bg-zinc-800 text-zinc-500"
                        : "bg-zinc-900 text-indigo-100 shadow-lg shadow-indigo-500/10 hover:bg-zinc-800"
                    )}
                  >
                    Hello World ({active.name})
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-950 via-zinc-950/80 to-black p-4 shadow-inner">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-white">Response Stream</div>
                  <div className="text-xs text-zinc-500">Live output from {active.name}</div>
                </div>
                <button
                  onClick={() => {
                    setOutput("");
                    setMeta(null);
                    setStatus("Output cleared.");
                  }}
                  className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800"
                >
                  Clear
                </button>
              </div>

              <div className="mt-3 max-h-[420px] overflow-y-auto rounded-xl border border-zinc-900 bg-black/70 p-4 shadow-inner scroll-smooth">
                <pre className="whitespace-pre-wrap break-words text-sm leading-relaxed text-zinc-100">
                  {output || "Awaiting output…"}
                </pre>
                <div ref={feedRef} />
              </div>

              {meta ? (
                <div className="mt-3 grid gap-2 text-xs text-zinc-400 md:grid-cols-3">
                  <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2">
                    <div className="text-zinc-500">Provider</div>
                    <div className="text-white">{meta.provider || "—"}</div>
                  </div>
                  <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2">
                    <div className="text-zinc-500">Model</div>
                    <div className="text-white">{meta.model || "—"}</div>
                  </div>
                  <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2">
                    <div className="text-zinc-500">Latency</div>
                    <div className="text-white">{meta.latency ? `${meta.latency} ms` : "—"}</div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <aside className="space-y-3">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 shadow-lg shadow-zinc-900/40">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-white">Agents</div>
                <div className="text-xs text-zinc-500">Hello World ready</div>
              </div>
              <div className="mt-3 grid gap-3">
                {AGENTS.map((a) => (
                  <div
                    key={a.id}
                    className={clsx(
                      "relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 transition hover:border-emerald-500/40",
                      agent === a.id ? "ring-2 ring-emerald-500/40" : "ring-1 ring-transparent"
                    )}
                  >
                    <div
                      className={clsx(
                        "pointer-events-none absolute inset-0 opacity-25 blur-3xl",
                        `bg-gradient-to-r ${a.tone}`
                      )}
                    />
                    <div className="relative flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => setAgent(a.id)}
                          className="text-left"
                          aria-pressed={agent === a.id}
                        >
                          <div className="text-sm font-semibold text-white">{a.name}</div>
                          <div className="text-xs text-zinc-400">{a.role}</div>
                        </button>
                        <span className="rounded-full bg-black/60 px-2 py-1 text-[10px] text-zinc-300">
                          {a.provider}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-zinc-400">
                        <div className="font-mono text-[11px] text-zinc-300">{a.model}</div>
                        <button
                          onClick={() => hello(a.id)}
                          disabled={sending}
                          className="rounded-lg bg-zinc-800 px-2 py-1 text-[11px] font-semibold text-zinc-100 hover:bg-zinc-700"
                        >
                          Hello
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4 text-xs text-zinc-400 shadow-inner">
              <div className="text-sm font-semibold text-white">Live Notes</div>
              <ul className="mt-2 space-y-2">
                <li>• No login required. Direct fire to /api/ai/exec.</li>
                <li>• Each agent has a one-click Hello World for instant validation.</li>
                <li>• Latency + provider/model surfaced for fast verification.</li>
              </ul>
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
}

