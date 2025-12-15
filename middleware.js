import { NextResponse } from "next/server";

export const config = {
  matcher: [
    "/war-room/:path*",
    "/api/private/:path*"
  ]
};

export async function middleware(req) {
  const auth = req.headers.get("authorization") || "";
  const hasBearer = /^Bearer\s+.+$/i.test(auth);

  if (!hasBearer) {
    return NextResponse.json({ ok: false, error: "Missing bearer token" }, { status: 401 });
  }

  return NextResponse.next();
}
