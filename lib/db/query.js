import { getPool } from "./pool.js";

export async function query(text, params = []) {
  const pool = getPool();
  const res = await pool.query(text, params);
  return res;
}

export async function queryOne(text, params = []) {
  const res = await query(text, params);
  return res.rows[0] || null;
}
