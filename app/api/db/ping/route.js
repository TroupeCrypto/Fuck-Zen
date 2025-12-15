export const runtime = "nodejs";

import { json, serverError } from "../../_utils/respond.js";
import { queryOne } from "../../../../lib/db/query.js";

export async function GET() {
  try {
    const row = await queryOne("select now() as now");
    return json(200, { ok: true, now: row?.now || null });
  } catch (e) {
    return serverError("DB ping failed");
  }
}
