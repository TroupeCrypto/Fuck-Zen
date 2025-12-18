import pg from "pg";
import { mustEnv } from "../env.js";

const { Pool } = pg;

let _pool;

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

export function getPool() {
  if (_pool) return _pool;

  const rawConnectionString = mustEnv("DATABASE_URL");
  const connectionString = sanitizeDatabaseUrl(rawConnectionString);

  const ssl =
    process.env.PGSSL === "disable"
      ? undefined
      : { rejectUnauthorized: false };

  _pool = new Pool({
    connectionString,
    ssl,
    max: Number(process.env.PGPOOL_MAX || "10"),
    idleTimeoutMillis: Number(process.env.PGPOOL_IDLE_MS || "30000"),
    connectionTimeoutMillis: Number(
      process.env.PGPOOL_CONN_TIMEOUT_MS || "5000"
    ),
  });

  return _pool;
}
