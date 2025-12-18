export const runtime = "nodejs";

import { json, serverError } from "../../_utils/respond.js";
import { queryOne } from "../../../../lib/db/query.js";

function redactDbUrlForLog(raw) {
  try {
    const u = new URL(raw);
    return {
      protocol: u.protocol,
      username: u.username || null,
      host: u.hostname || null,
      port: u.port || null,
      database: (u.pathname || "").replace("/", "") || null,
      hasSslmode: u.searchParams.has("sslmode"),
      sslmode: u.searchParams.get("sslmode") || null,
    };
  } catch {
    // In case someone pasted a non-URL format, return minimal safe hint
    return { protocol: null, username: null, host: null, port: null, database: null, hasSslmode: false, sslmode: null };
  }
}

export async function GET() {
  try {
    const raw = process.env.DATABASE_URL || "";
    const hasDbUrl = !!raw && !!String(raw).trim();

    const parsed = hasDbUrl ? redactDbUrlForLog(raw) : null;

    const row = await queryOne("select now() as now");

    return json(200, {
      ok: true,
      now: row?.now || null,
      hasDbUrl,
      parsed,
    });
  } catch (e) {
    const raw = process.env.DATABASE_URL || "";
    const hasDbUrl = !!raw && !!String(raw).trim();
    const parsed = hasDbUrl ? redactDbUrlForLog(raw) : null;

    const name = e?.name ? String(e.name) : "Error";
    const code = e?.code ? String(e.code) : null;
    const message = e?.message ? String(e.message) : "Unknown error";

    return serverError(`DB ping failed: ${name}${code ? ` (${code})` : ""}: ${message}`, {
      hasDbUrl,
      parsed,
    });
  }
}
