import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/src/lib/prisma";
import { signSession } from "@/src/lib/auth";
import { SESSION_COOKIE, cookieOptions } from "@/src/lib/cookies";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const emailRaw = (body?.email as string | undefined)?.trim();
    const password = body?.password as string | undefined;

    if (!emailRaw || !password) {
      return NextResponse.json({ error: "email and password are required" }, { status: 400 });
    }

    const email = emailRaw.toLowerCase();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = await signSession({
      sub: user.id,
      email: user.email,
      name: user.name ?? null,
    });

    const res = NextResponse.json({ ok: true }, { status: 200 });
    res.cookies.set(SESSION_COOKIE, token, {
      ...cookieOptions(),
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });
    return res;
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
