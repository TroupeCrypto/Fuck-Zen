export const runtime = "nodejs";

export async function GET() {
  return Response.json({
    ok: true,
    service: "troupe-war-room",
    ts: new Date().toISOString()
  });
}
