import jwt from "jsonwebtoken";

const fallbackSecret = process.env.NODE_ENV === "production" ? null : "dev_secret_do_not_use_in_prod";
const JWT_SECRET = process.env.JWT_SECRET || fallbackSecret;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "12h";

function ensureSecret() {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET must be configured");
  }
}

export function signAccessToken(payload) {
  ensureSecret();
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyAccessToken(token) {
  try {
    ensureSecret();
    const decoded = jwt.verify(token, JWT_SECRET);
    return { ok: true, payload: decoded };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}
