import { verifyAccessToken } from "./jwt.js";

function parseBearer(req) {
  const h = req.headers.get("authorization") || "";
  const m = h.match(/^Bearer\s+(.+)$/i);
  return m ? m[1] : null;
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
        roles: Array.isArray(decoded.roles) ? decoded.roles : []
      }
    };
  } catch {
    return { ok: false, error: "Invalid or expired token" };
  }
}

export function requireRole(session, requiredRole) {
  const roles = session?.roles || [];
  return roles.includes(requiredRole);
}
