export const runtime = "nodejs";

import { json, serverError } from "../../../_utils/respond.js";
import { query } from "../../../../../lib/db/query.js";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const department = searchParams.get("department");
    const subdepartment = searchParams.get("subdepartment");
    const assigned_system = searchParams.get("assigned_system");

    const conditions = [];
    const params = [];

    if (department) {
      params.push(department);
      conditions.push(`department = $${params.length}`);
    }

    if (subdepartment) {
      params.push(subdepartment);
      conditions.push(`subdepartment = $${params.length}`);
    }

    if (assigned_system) {
      params.push(assigned_system);
      conditions.push(`assigned_system = $${params.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const res = await query(
      `SELECT name, slug, job_title, department, subdepartment, assigned_system, created_at
       FROM idecyde_employees
       ${where}
       ORDER BY created_at DESC
       LIMIT 200`,
      params
    );

    return json(200, res.rows || []);
  } catch (err) {
    console.error("idecyde list error", err);
    return serverError("Failed to list employees");
  }
}
