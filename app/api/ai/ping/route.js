export const runtime = "nodejs";

import OpenAI from "openai";
import { json, serverError } from "../../_utils/respond.js";

export async function GET() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || !String(apiKey).trim()) {
    return serverError("OPENAI_API_KEY is not configured");
  }

  const client = new OpenAI({ apiKey });

  try {
    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: "Reply with the single word: ok",
      max_output_tokens: 5
    });

    const reply =
      response.output_text ||
      response.output?.[0]?.content?.[0]?.text ||
      "";

    return json(200, { ok: true, provider: "openai", reply });
  } catch (e) {
    const message = e?.message ? String(e.message) : String(e);
    return serverError(message);
  }
}
