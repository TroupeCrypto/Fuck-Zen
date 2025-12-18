import OpenAI from "openai";
import { query, queryOne } from "../db/query.js";
import { mustEnv } from "../env.js";
import { toSlug } from "./slug.js";
import { makeSignatureSvg } from "./signature.js";
import { generateEmployeeProfile } from "./providers/openai.js";

let _openai;

function getOpenAI() {
  if (_openai) return _openai;
  _openai = new OpenAI({ apiKey: mustEnv("OPENAI_API_KEY") });
  return _openai;
}

export function chooseSystemForRole({ department = "", subdepartment = "", job_title = "" }) {
  const text = `${department} ${subdepartment} ${job_title}`.toLowerCase();

  if (text.includes("security") || text.includes("devops") || text.includes("backend")) {
    return "chatgpt";
  }

  if (text.includes("creative") || text.includes("music") || text.includes("art")) {
    return "chatgpt";
  }

  if (text.includes("legal") || text.includes("ops writing") || text.includes("operations writing") || text.includes("longform")) {
    return "claude";
  }

  if (text.includes("research") || text.includes("analysis") || text.includes("analyst")) {
    return "gemini";
  }

  return "chatgpt";
}

async function generateAvatar({ prompt }) {
  try {
    const client = getOpenAI();
    if (!client.images || typeof client.images.generate !== "function") {
      return { avatar_image_b64: null, avatar_image_url: null };
    }

    const image = await client.images.generate({
      model: "gpt-image-1",
      prompt,
      size: "512x512",
      response_format: "b64_json"
    });

    const data = image?.data?.[0] || {};
    return {
      avatar_image_b64: data.b64_json || null,
      avatar_image_url: data.url || null
    };
  } catch {
    return { avatar_image_b64: null, avatar_image_url: null };
  }
}

export async function jarvisCreateEmployees({ count = 1, job_title, department, subdepartment, with_avatar = false }) {
  const total = Math.max(1, Math.min(Number(count) || 1, 25));
  const created = [];

  for (let i = 0; i < total; i++) {
    const assigned_system = chooseSystemForRole({ department, subdepartment, job_title });

    let attempt = 0;
    let inserted = null;

    while (attempt < 3 && !inserted) {
      attempt += 1;

      const profile = await generateEmployeeProfile({
        job_title,
        department,
        subdepartment,
        assigned_system
      });

      const name = profile.name?.trim();
      let slug = toSlug(name);

      if (!slug) {
        slug = toSlug(`${name || "employee"}-${Date.now()}-${Math.floor(Math.random() * 1000)}`);
      }

      const conflict = await queryOne(
        "SELECT 1 FROM idecyde_employees WHERE name = $1 OR slug = $2",
        [name, slug]
      );

      if (conflict) {
        continue;
      }

      const signature_text = profile.signature_text || `— ${name}`;
      const signature_svg = makeSignatureSvg(signature_text);
      const avatar_prompt = profile.avatar_prompt || `professional portrait of ${name}`;

      let avatar_image_b64 = null;
      let avatar_image_url = null;

      if (with_avatar) {
        const generatedAvatar = await generateAvatar({ prompt: avatar_prompt });
        avatar_image_b64 = generatedAvatar.avatar_image_b64;
        avatar_image_url = generatedAvatar.avatar_image_url;
      }

      try {
        const row = await queryOne(
          `INSERT INTO idecyde_employees (
            name,
            slug,
            assigned_system,
            job_title,
            department,
            subdepartment,
            persona_text,
            skills,
            interests,
            avatar_prompt,
            avatar_image_url,
            avatar_image_b64,
            signature_text,
            signature_svg
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
          )
          RETURNING name, slug, assigned_system, job_title, department, subdepartment, created_at`,
          [
            name,
            slug,
            assigned_system,
            job_title,
            department,
            subdepartment,
            profile.persona_text || "",
            Array.isArray(profile.skills) ? profile.skills : [],
            Array.isArray(profile.interests) ? profile.interests : [],
            avatar_prompt || null,
            avatar_image_url || null,
            avatar_image_b64 || null,
            signature_text,
            signature_svg
          ]
        );

        inserted = row;
        created.push({ name: row.name, slug: row.slug });
      } catch (err) {
        if (err?.code === "23505") {
          inserted = null;
          continue;
        }
        throw err;
      }
    }

    if (!inserted) {
      throw new Error("Failed to generate unique employee after 3 attempts");
    }
  }

  return created;
}
