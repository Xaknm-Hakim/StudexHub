import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { prisma } from "@/src/lib/prisma";

function sha256(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

function parseInvite(input: string) {
  const raw = input.trim();
  const parts = raw.split("-");
  if (parts.length !== 2) return null;

  const codeId = parts[0].trim().toUpperCase();
  const otp = parts[1].trim().toUpperCase();

  if (!codeId || !otp) return null;
  return { codeId, otp };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const name = (body?.name as string | undefined)?.trim() || null;
    const emailRaw = (body?.email as string | undefined)?.trim();
    const password = body?.password as string | undefined;
    const inviteCodeRaw = body?.inviteCode as string | undefined;

    if (!emailRaw || !password || !inviteCodeRaw) {
      return NextResponse.json(
        { error: "email, password, inviteCode are required" },
        { status: 400 }
      );
    }

    const email = emailRaw.toLowerCase();

    // Parse CODEID-OTP
    const parsed = parseInvite(inviteCodeRaw);
    if (!parsed) {
      return NextResponse.json(
        { error: "Invite code format must be CODEID-OTP" },
        { status: 400 }
      );
    }

    const { codeId, otp } = parsed;

    // Find invite record by codeId (so we can track attempts)
    const invite = await prisma.inviteCode.findUnique({
      where: { codeId },
    });

    if (!invite) {
      // No such invite id
      return NextResponse.json({ error: "Invalid invite code" }, { status: 401 });
    }

    const now = new Date();

    if (invite.usedAt) {
      return NextResponse.json({ error: "Invite code already used" }, { status: 403 });
    }

    if (invite.lockedAt) {
      return NextResponse.json({ error: "Invite code locked" }, { status: 403 });
    }

    if (invite.expiresAt <= now) {
      return NextResponse.json({ error: "Invite code expired" }, { status: 403 });
    }

    // Validate OTP by comparing hash (with optional pepper)
    const pepper = process.env.INVITE_PEPPER ?? "";
    const otpHash = sha256(otp + pepper);

    if (otpHash !== invite.codeHash) {
      // Wrong OTP -> increment attempts and lock at 5
      const nextAttempts = invite.attemptCount + 1;

      await prisma.inviteCode.update({
        where: { id: invite.id },
        data:
          nextAttempts >= 5
            ? { attemptCount: nextAttempts, lockedAt: now }
            : { attemptCount: nextAttempts },
      });

      return NextResponse.json({ error: "Invalid invite code" }, { status: 401 });
    }

    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    // Create user + mark invite used
    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.$transaction([
      prisma.user.create({
        data: {
          email,
          name,
          passwordHash,
        },
      }),
      prisma.inviteCode.update({
        where: { id: invite.id },
        data: {
          usedAt: now,
        },
      }),
    ]);

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Signup failed" }, { status: 500 });
  }
}
