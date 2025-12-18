import pg from "pg";
import { mustEnv } from "../env.js";

const { Pool } = pg;

let _pool;

export function getPool() {
  if (_pool) return _pool;

  const connectionString = mustEnv("DATABASE_URL");

  const ssl =
    process.env.PGSSL === "disable"
      ? undefined
      : { rejectUnauthorized: false };

  _pool = new Pool({
    connectionString,
    ssl,
    max: Number(process.env.PGPOOL_MAX || "10"),
    idleTimeoutMillis: Number(process.env.PGPOOL_IDLE_MS || "30000"),
    connectionTimeoutMillis: Number(process.env.PGPOOL_CONN_TIMEOUT_MS || "5000"),
  });

  return _pool;
}
