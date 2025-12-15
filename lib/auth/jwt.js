import jwt from "jsonwebtoken";
import { mustEnv } from "../env.js";

const SECRET = () => mustEnv("JWT_SECRET");
const ISS = () => process.env.JWT_ISSUER || "troupe-war-room";
const AUD = () => process.env.JWT_AUDIENCE || "troupe-war-room-web";

export async function signAccessToken(payload) {
  return jwt.sign(payload, SECRET(), {
    algorithm: "HS256",
    issuer: ISS(),
    audience: AUD(),
    expiresIn: "2h"
  });
}

export async function verifyAccessToken(token) {
  return jwt.verify(token, SECRET(), {
    algorithms: ["HS256"],
    issuer: ISS(),
    audience: AUD()
  });
}
