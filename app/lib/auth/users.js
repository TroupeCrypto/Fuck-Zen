import { createHash, timingSafeEqual } from "crypto";

const DEFAULT_USER_EMAIL = (process.env.DEFAULT_USER_EMAIL || "zen@troupe.inc").toLowerCase();
const DEFAULT_USER_PASSWORD = process.env.DEFAULT_USER_PASSWORD || "password123";

const hashPassword = (value) => createHash("sha256").update(value).digest();

const STATIC_USERS = [
  {
    id: "003",
    email: DEFAULT_USER_EMAIL,
    hashedPassword: hashPassword(DEFAULT_USER_PASSWORD),
    display_name: "Zen Master",
    roles: ["ADMIN", "KTD_OFFICER"]
  }
];

export function verifyUserPassword({ email, password }) {
  const user = STATIC_USERS.find((u) => u.email === email);
  if (!user) return null;

  const incomingHash = hashPassword(password);
  if (!timingSafeEqual(user.hashedPassword, incomingHash)) return null;

  const { hashedPassword: _pw, ...safeUser } = user;
  return safeUser;
}
