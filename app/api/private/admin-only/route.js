export const runtime = "nodejs";

import { json, forbidden, unauthorized } from "../../_utils/respond.js";
import { requireAuth, requireRole } from "../../../../lib/auth/requireAuth.js";

export async function GET(req) {
  const auth = await requireAuth(req);
  if (!auth.ok) return unauthorized(auth.error);

  if (!requireRole(auth.session, "admin")) return forbidden("admin role required");

  return json(200, { ok: true, secret: "cleared" });
}
