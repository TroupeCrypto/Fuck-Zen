export const runtime = "nodejs";

import dns from "node:dns/promises";

export async function GET() {
  const host = "db.htqsuzbdiutofycoqxsn.supabase.co";
  try {
    const res = await dns.lookup(host);
    return Response.json({ ok: true, host, address: res.address, family: res.family });
  } catch (e) {
    return Response.json(
      { ok: false, host, error: String(e?.message || e), code: e?.code || null },
      { status: 500 }
    );
  }
}
