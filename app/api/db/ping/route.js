export const runtime = "nodejs";

import { json, serverError } from "../../_utils/respond.js";
import { queryOne } from "../../../../lib/db/query.js";

export async function GET() {
  try {
    // Quick sanity check that the env var exists at runtime
    const hasDbUrl = !!process.env.DATABASE_URL;

    const row = await queryOne("select now() as now");

    return json(200, {
      ok: true,
      now: row?.now || null,
      hasDbUrl,
    });
  } catch (e) {
    // Return a debug-safe error message (no secrets)
    const message = e?.message ? String(e.message) : "Unknown error";
    const code = e?.code ? String(e.code) : null;
    const name = e?.name ? String(e.name) : null;

    // IMPORTANT: don’t ever echo DATABASE_URL
    return serverError(
      `DB ping failed: ${name || "Error"}${code ? ` (${code})` : ""}: ${message}`
    );
  }
}
