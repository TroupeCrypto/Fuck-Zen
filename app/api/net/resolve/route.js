// app/api/net/resolve/route.js
export const runtime = "nodejs";
import dns from "node:dns/promises";

export async function GET() {
  try {
    const host = "db.htqsuzbdiutofycoqxsn.supabase.co";
    const res = await dns.lookup(host);
    return Response.json({ ok: true, host, address: res.address });
  } catch (e) {
    return Response.json(
      { ok: false, host, code: e.code, message: String(e.message) },
      { status: 500 }
    );
  }
}
