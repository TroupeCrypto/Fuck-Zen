// NOTE: This is a real DB-backed verifier hook.
// It expects a users table with (id, email, password_hash, display_name) and role mapping.
// If your schema differs, adapt ONLY this file.
import crypto from "crypto";
import { queryOne } from "../db/query.js";

const DEFAULT_PBKDF2_ITERATIONS = 310000;
const DEFAULT_PBKDF2_KEYLEN = 32;

function timingSafeEqual(a, b) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

// PBKDF2 format stored as: pbkdf2$sha256$<iters>$<salt_b64>$<hash_b64>
function verifyPbkdf2(stored, password) {
  try {
    const [k, algo, itersStr, saltB64, hashB64] = stored.split("$");
    if (k !== "pbkdf2") return false;
    const iters = Number(itersStr);
    const salt = Buffer.from(saltB64, "base64");
    const expected = Buffer.from(hashB64, "base64");
    const derived = crypto.pbkdf2Sync(password, salt, iters, expected.length, "sha256");
    return timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}

// Create a PBKDF2 hash string compatible with verifyUserPassword
export function hashPassword(password, { iterations = DEFAULT_PBKDF2_ITERATIONS } = {}) {
  const salt = crypto.randomBytes(16);
  const derived = crypto.pbkdf2Sync(password, salt, iterations, DEFAULT_PBKDF2_KEYLEN, "sha256");
  return `pbkdf2$sha256$${iterations}$${salt.toString("base64")}$${derived.toString("base64")}`;
}

export async function verifyUserPassword({ email, password }) {
  const user = await queryOne(
    `select id, email, display_name, password_hash
     from users
     where lower(email) = lower($1)
     limit 1`,
    [email]
  );

  if (!user?.password_hash) return null;
  if (!verifyPbkdf2(user.password_hash, password)) return null;

  const rolesRows = await queryOne(
    `select coalesce(json_agg(r.name order by r.name), '[]'::json) as roles
     from user_roles ur
     join roles r on r.id = ur.role_id
     where ur.user_id = $1`,
    [user.id]
  );

  const roles = Array.isArray(rolesRows?.roles) ? rolesRows.roles : [];

  return {
    id: user.id,
    email: user.email,
    display_name: user.display_name || null,
    roles
  };
}
