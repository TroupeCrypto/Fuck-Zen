export const runtime = "nodejs";

import { json, serverError } from "../../_utils/respond.js";
import { queryOne } from "../../../../lib/db/query.js";

/**
 * Parse a database URL and return non-sensitive connection details for diagnostics.
 * @param {string} raw
 * @returns {{protocol?: string, host?: string, port?: string, database?: string, hasQuery?: string[], invalid?: boolean}} Object with connection details; hasQuery lists query parameter keys.
 */
function inspectDbUrl(raw) {
  try {
    const u = new URL(raw);
    const pathname = u.pathname || "";
    return {
      protocol: u.protocol,
      host: u.hostname,
      port: u.port,
      database: pathname.replace(/^\//, ""),
      hasQuery: [...u.searchParams.keys()],
    };
  } catch (_) {
    return { invalid: true };
  }
}

export async function GET() {
  try {
    const raw = process.env.DATABASE_URL || "";
    const inspected = inspectDbUrl(raw);

    const row = await queryOne("select now() as now");

    return json(200, {
      ok: true,
      now: row?.now || null,
      db: inspected,
      sslEnforcedByPool: process.env.PGSSL !== "disable",
    });
  } catch (e) {
    const code = e?.code ? `${e.code} ` : "";
    const message = e?.message || e?.toString?.() || "Unknown error";
    return serverError(`DB ping failed: ${code}${message}`, {
      sslEnforcedByPool: process.env.PGSSL !== "disable",
    });
  }
}
