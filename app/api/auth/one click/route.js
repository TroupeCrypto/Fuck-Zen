export const runtime = "nodejs";

import jwt from "jsonwebtoken";

export async function GET() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    return new Response(
      JSON.stringify({ ok: false, error: "JWT_SECRET missing or too short" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const token = jwt.sign(
    { sub: "admin", email: process.env.AUTH_EMAIL || "admin" },
    secret,
    { expiresIn: "1h" }
  );

  return new Response(
    JSON.stringify({ ok: true, token }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}
