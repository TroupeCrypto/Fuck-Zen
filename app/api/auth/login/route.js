export const runtime = "nodejs";

import { readJson } from "../../_utils/body.js";
import { json, badRequest, unauthorized } from "../../_utils/respond.js";
import { signAccessToken } from "../../../lib/auth/jwt.js";
import { verifyUserPassword } from "../../../lib/auth/users.js";

export async function POST(req) {
  const body = await readJson(req);
  if (!body) return badRequest("Expected application/json body");

  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");

  if (!email || !password) return badRequest("email and password are required");

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) return badRequest("invalid email format");
  if (password.length < 8) return badRequest("password must be at least 8 characters");

  const user = await verifyUserPassword({ email, password });
  if (!user) return unauthorized("Invalid credentials");

  const token = await signAccessToken({
    sub: user.id,
    email: user.email,
    roles: user.roles
  });

  return json(200, {
    ok: true,
    token,
    user: {
      id: user.id,
      email: user.email,
      display_name: user.display_name,
      roles: user.roles
    }
  });
}
