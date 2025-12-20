//// FILE: lib/auth/requireAuth.js
import { verifyAccessToken } from "./jwt.js";

function parseBearer(req) {
  let raw;
  try {
    raw = req.headers.get("authorization");
  } catch (err) {
    raw = err?.message || String(err);
  }

  const headerValue =
    typeof raw === "string" ? raw : (raw?.message || String(raw || ""));

  const m = headerValue?.match?.(/^Bearer\s+(.+)$/i);
  return m ? String(m[1] || "").trim() : null;
}

export async function requireAuth(req) {
  const token = parseBearer(req);
  if (!token) return { ok: false, error: "Missing bearer token" };

  try {
    const decoded = await verifyAccessToken(token);
    return {
      ok: true,
      session: {
        user_id: decoded.sub,
        email: decoded.email || null,
        roles: Array.isArray(decoded.roles) ? decoded.roles : [],
      },
    };
  } catch {
    return { ok: false, error: "Invalid or expired token" };
  }
}

export function requireRole(session, requiredRole) {
  const roles = session?.roles || [];
  return roles.includes(requiredRole);
}
