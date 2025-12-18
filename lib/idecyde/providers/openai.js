import OpenAI from "openai";
import { mustEnv } from "../../env.js";

let _client;

function getClient() {
  if (_client) return _client;

  _client = new OpenAI({
    apiKey: mustEnv("OPENAI_API_KEY")
  });

  return _client;
}

export async function generateEmployeeProfile({ job_title, department, subdepartment, assigned_system }) {
  const client = getClient();

  const input = [
    {
      role: "system",
      content: [
        {
          type: "text",
          text:
            "You generate vivid but operational employee personas for an internal system. " +
            "Return ONLY JSON. Do not include any id fields. Always include a name. " +
            "Keep everything brand-safe, practical, and concise."
        }
      ]
    },
    {
      role: "user",
      content: [
        {
          type: "text",
          text: `Create a fictional employee for:
Department: ${department || "unknown"}
Subdepartment: ${subdepartment || "unspecified"}
Role: ${job_title || "staff"}
Assigned System: ${assigned_system || "chatgpt"}

Respond with JSON using this exact shape:
{
  "name": "unique, human-readable name",
  "persona_text": "2-3 sentences of vivid operational detail",
  "skills": ["skill 1", "skill 2", "skill 3"],
  "interests": ["interest 1", "interest 2", "interest 3"],
  "avatar_prompt": "safe visual description of their look/style",
  "signature_text": "stylized signature text beginning with an em dash (—)"
}

Rules:
- No id or UUID fields.
- Name must always be present.
- Keep the tone confident and professional.`
        }
      ]
    }
  ];

  const response = await client.responses.create({
    model: "gpt-4.1-mini",
    input,
    response_format: { type: "json_object" },
    max_output_tokens: 600
  });

  const raw =
    response.output_text ||
    response.output?.[0]?.content?.find(part => part.type === "text")?.text ||
    "";

  if (!raw || typeof raw !== "string") {
    throw new Error("Empty response from OpenAI");
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new Error("Invalid JSON from OpenAI");
  }

  const profile = {
    name: parsed?.name ? String(parsed.name).trim() : "",
    persona_text: parsed?.persona_text ? String(parsed.persona_text).trim() : "",
    skills: Array.isArray(parsed?.skills) ? parsed.skills.map(s => String(s)) : [],
    interests: Array.isArray(parsed?.interests) ? parsed.interests.map(s => String(s)) : [],
    avatar_prompt: parsed?.avatar_prompt ? String(parsed.avatar_prompt).trim() : "",
    signature_text: parsed?.signature_text ? String(parsed.signature_text).trim() : ""
  };

  if (!profile.name) {
    throw new Error("Profile missing name");
  }

  return profile;
}
