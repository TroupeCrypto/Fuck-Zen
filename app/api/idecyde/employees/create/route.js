export const runtime = "nodejs";

import { json, badRequest, serverError } from "../../../_utils/respond.js";
import { readJson } from "../../../_utils/body.js";
import { jarvisCreateEmployees } from "../../../../../lib/idecyde/jarvis.js";

export async function POST(req) {
  const { searchParams } = new URL(req.url);
  const withAvatar = searchParams.get("with_avatar") === "true";

  const body = await readJson(req);
  if (!body) {
    return badRequest("Expected application/json body");
  }

  const { count = 1, job_title, department, subdepartment } = body;

  if (!job_title || !department || !subdepartment) {
    return badRequest("Missing required fields: job_title, department, subdepartment");
  }

  const total = Math.max(1, Math.min(parseInt(count, 10) || 1, 25));

  try {
    const created = await jarvisCreateEmployees({
      count: total,
      job_title,
      department,
      subdepartment,
      with_avatar: withAvatar
    });

    return json(200, { ok: true, created });
  } catch (err) {
    console.error("idecyde create error", err);
    return serverError("Failed to create employees");
  }
}
