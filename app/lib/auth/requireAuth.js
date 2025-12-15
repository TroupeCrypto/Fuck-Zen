import { verifyAccessToken } from "./jwt.js";

export async function requireAuth(req) {
  const header = req.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return { ok: false, error: "Missing bearer token" };
  }

  const verified = await verifyAccessToken(token);
  if (!verified.ok) {
    return { ok: false, error: verified.error || "Invalid token" };
  }

  return { ok: true, session: verified.payload };
}
