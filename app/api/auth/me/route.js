export const runtime = "nodejs";

import { json, unauthorized } from "../../_utils/respond.js";
import { requireAuth } from "../../../../lib/auth/requireAuth.js";

export async function GET(req) {
  const auth = await requireAuth(req);
  if (!auth.ok) return unauthorized(auth.error);

  return json(200, { ok: true, session: auth.session });
}
