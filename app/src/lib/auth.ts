import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/src/lib/cookies";

function getSecret(): string {
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error("AUTH_SECRET is missing");
  }

  return secret;
}

function getKey(): Uint8Array {
  return new TextEncoder().encode(getSecret());
}

export type SessionPayload = {
  sub: string;
  email: string;
  name: string | null;
};

export async function signSession(payload: SessionPayload, expiresInDays = 7) {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + expiresInDays * 24 * 60 * 60;

  return await new SignJWT({ email: payload.email, name: payload.name })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt(now)
    .setExpirationTime(exp)
    .sign(getKey());
}

export async function verifySession(token: string) {
  const { payload } = await jwtVerify(token, getKey(), {
    algorithms: ["HS256"],
  });

  const sub = payload.sub;
  const email = payload.email;
  const name = payload.name ?? null;

  if (typeof sub !== "string" || typeof email !== "string") {
    throw new Error("Invalid session payload");
  }

  return { sub, email, name: typeof name === "string" ? name : null };
}

export async function getSession() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    return await verifySession(token);
  } catch {
    return null;
  }
}

export async function requireUserId() {
  const session = await getSession();
  if (!session?.sub) throw new Error("UNAUTHORIZED");
  return session.sub;
}
