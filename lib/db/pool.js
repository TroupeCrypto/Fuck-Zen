// /lib/db/pool.js
import pg from "pg";
import { mustEnv } from "../env.js";

const { Pool } = pg;

let _pool = null;
let _initPromise = null;

/**
 * Remove SSL query parameters so pool-level SSL config cannot be overridden.
 * @param {string} raw - Raw database URL from env.
 * @returns {string} Sanitized database URL with SSL params removed.
 */
function sanitizeDatabaseUrl(raw) {
  try {
    const u = new URL(raw);

    // Strip SSL-related params that can override pg ssl config
    u.searchParams.delete("sslmode");
    u.searchParams.delete("sslrootcert");
    u.searchParams.delete("sslcert");
    u.searchParams.delete("sslkey");
    u.searchParams.delete("sslpassword");
    u.searchParams.delete("sslcrl");

    return u.toString();
  } catch (_) {
    // If URL parsing fails, return raw so downstream pool init surfaces the error
    return raw;
  }
}

function parseBool(v, def = false) {
  if (v == null) return def;
  const s = String(v).trim().toLowerCase();
  if (["1", "true", "t", "yes", "y", "on", "enable", "enabled"].includes(s)) return true;
  if (["0", "false", "f", "no", "n", "off", "disable", "disabled"].includes(s)) return false;
  return def;
}

function buildSslConfig() {
  // Backwards-compatible defaults:
  // - If PGSSL=disable => no TLS
  // - Otherwise => default to rejectUnauthorized:false (matches your prior behavior)
  //
  // Optional strictness knobs:
  // - PGSSL_STRICT=1 => rejectUnauthorized:true (unless explicitly overridden)
  // - PGSSL_REJECT_UNAUTH=1/0 => explicit override for rejectUnauthorized
  // - PGSSL_CA => PEM CA bundle (for strict validation with private CA)
  const pgssl = (process.env.PGSSL || "").trim().toLowerCase();
  if (pgssl === "disable" || pgssl === "off" || pgssl === "false" || pgssl === "0") return undefined;

  const strict = parseBool(process.env.PGSSL_STRICT, false);
  const explicitReject = process.env.PGSSL_REJECT_UNAUTH;

  // Default matches old behavior: relaxed (rejectUnauthorized:false) unless strict mode is on.
  const defaultReject = strict ? true : false;
  const rejectUnauthorized = explicitReject == null ? defaultReject : parseBool(explicitReject, defaultReject);

  const ca = process.env.PGSSL_CA;

  const ssl = {
    rejectUnauthorized,
    ...(ca ? { ca } : {}),
    // When not rejecting unauthorized certs, also bypass hostname checks to avoid noisy failures on imperfect chains.
    ...(rejectUnauthorized ? {} : { checkServerIdentity: () => undefined }),
  };

  // Absolute last-resort global relax, only if explicitly requested.
  if (!rejectUnauthorized && parseBool(process.env.PGSSL_GLOBAL_RELAX, false)) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  }

  return ssl;
}

function buildPool() {
  const rawConnectionString = mustEnv("DATABASE_URL");
  const connectionString = sanitizeDatabaseUrl(rawConnectionString);
  const ssl = buildSslConfig();

  const pool = new Pool({
    connectionString,
    ssl,
    max: Number(process.env.PGPOOL_MAX || "10"),
    idleTimeoutMillis: Number(process.env.PGPOOL_IDLE_MS || "30000"),
    connectionTimeoutMillis: Number(process.env.PGPOOL_CONN_TIMEOUT_MS || "5000"),
    keepAlive: true,
  });

  // Fail-fast on unexpected pool errors to prevent silent “retry loops”.
  pool.on("error", (err) => {
    console.error("[db] pool error:", err?.message || err);
    if (parseBool(process.env.PGPOOL_FATAL_ON_ERROR, true)) {
      process.exit(1);
    }
  });

  return pool;
}

export function getPool() {
  if (_pool) return _pool;
  _pool = buildPool();
  return _pool;
}

/**
 * One-time readiness check (fail-fast). Resets the pool on failure so subsequent attempts
 * don't reuse a poisoned pool.
 */
export async function assertDbReady() {
  if (_initPromise) return _initPromise;

  _initPromise = (async () => {
    const pool = getPool();
    const timeoutMs = Number(process.env.PGREADY_TIMEOUT_MS || "8000");

    const timeout = new Promise((_, reject) => {
      const t = setTimeout(() => {
        clearTimeout(t);
        const e = new Error(`DB ready check timed out after ${timeoutMs}ms`);
        e.code = "DB_READY_TIMEOUT";
        reject(e);
      }, timeoutMs);
    });

    try {
      await Promise.race([pool.query("select 1 as ok"), timeout]);
      return true;
    } catch (err) {
      const msg = err?.message || String(err);
      console.error("[db] assertDbReady failed:", msg);

      // Reset bad pool so a later call can rebuild cleanly.
      try {
        await pool.end();
      } catch (_) {}

      _pool = null;
      _initPromise = null;

      throw err;
    }
  })();

  return _initPromise;
}

export async function closePool() {
  if (!_pool) return;
  const p = _pool;
  _pool = null;
  _initPromise = null;
  await p.end();
}
