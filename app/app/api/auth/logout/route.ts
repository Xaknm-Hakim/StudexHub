import { NextResponse } from "next/server";
import { SESSION_COOKIE, cookieOptions } from "@/src/lib/cookies";

export async function POST() {
  const res = NextResponse.json({ ok: true }, { status: 200 });
  res.cookies.set(SESSION_COOKIE, "", {
    ...cookieOptions(),
    maxAge: 0,
  });
  return res;
}
