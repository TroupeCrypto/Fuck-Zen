export const runtime = "nodejs";

import { queryOne } from "../../../../../../lib/db/query.js";
import { makeEmployeeTxt } from "../../../../../../lib/idecyde/txt.js";

export async function GET(req, { params }) {
  const slug = params?.slug;

  if (!slug) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const employee = await queryOne(
      "SELECT * FROM idecyde_employees WHERE slug = $1",
      [slug]
    );

    if (!employee) {
      return new Response("Not found", { status: 404 });
    }

    const content = makeEmployeeTxt(employee);

    return new Response(content, {
      status: 200,
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "content-disposition": `attachment; filename="${slug}.txt"`
      }
    });
  } catch (err) {
    console.error("idecyde txt error", err);
    return new Response("Server error", { status: 500 });
  }
}
