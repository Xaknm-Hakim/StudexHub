import "dotenv/config";
import { SignJWT, jwtVerify } from "jose";

const SECRET = process.env.AUTH_SECRET;
if (!SECRET) throw new Error("AUTH_SECRET is missing in .env");

const key = new TextEncoder().encode(SECRET);

export type SessionPayload = {
  sub: string; // userId
  email: string;
  name: string | null;
};

export async function signSession(payload: SessionPayload, expiresInDays = 7) {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + expiresInDays * 24 * 60 * 60;

  const jwt = await new SignJWT({ email: payload.email, name: payload.name })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt(now)
    .setExpirationTime(exp)
    .sign(key);

  return jwt;
}

export async function verifySession(token: string) {
  const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"] });

  const sub = payload.sub;
  const email = payload.email;
  const name = payload.name ?? null;

  if (typeof sub !== "string" || typeof email !== "string") {
    throw new Error("Invalid session payload");
  }

  return { sub, email, name: typeof name === "string" ? name : null };
}
