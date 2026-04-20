import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { prisma } from "@/src/lib/prisma";
import type { ApiResponse } from "@/src/lib/types/api";

interface SignupSuccess {
  registered: true;
}

function sha256(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

function parseInvite(input: string) {
  const raw = input.trim();
  const parts = raw.split("-");

  if (parts.length !== 2) {
    return null;
  }

  const codeId = parts[0].trim().toUpperCase();
  const otp = parts[1].trim().toUpperCase();

  if (!codeId || !otp) {
    return null;
  }

  return { codeId, otp };
}

export async function POST(req: Request) {
  try {
    const body: unknown = await req.json();

    const name =
      typeof body === "object" && body !== null && "name" in body
        ? String(body.name ?? "").trim() || null
        : null;

    const emailRaw =
      typeof body === "object" && body !== null && "email" in body
        ? String(body.email ?? "").trim()
        : "";

    const password =
      typeof body === "object" && body !== null && "password" in body
        ? String(body.password ?? "")
        : "";

    const inviteCodeRaw =
      typeof body === "object" && body !== null && "inviteCode" in body
        ? String(body.inviteCode ?? "")
        : "";

    if (!emailRaw || !password || !inviteCodeRaw) {
      return NextResponse.json<ApiResponse<never>>(
        {
          ok: false,
          error: "email, password, inviteCode are required",
        },
        { status: 400 }
      );
    }

    const email = emailRaw.toLowerCase();

    const parsed = parseInvite(inviteCodeRaw);

    if (!parsed) {
      return NextResponse.json<ApiResponse<never>>(
        {
          ok: false,
          error: "Invite code format must be CODEID-OTP",
        },
        { status: 400 }
      );
    }

    const { codeId, otp } = parsed;

    const invite = await prisma.inviteCode.findUnique({
      where: { codeId },
    });

    if (!invite) {
      return NextResponse.json<ApiResponse<never>>(
        {
          ok: false,
          error: "Invalid invite code",
        },
        { status: 401 }
      );
    }

    const now = new Date();

    if (invite.usedAt) {
      return NextResponse.json<ApiResponse<never>>(
        {
          ok: false,
          error: "Invite code already used",
        },
        { status: 403 }
      );
    }

    if (invite.lockedAt) {
      return NextResponse.json<ApiResponse<never>>(
        {
          ok: false,
          error: "Invite code locked",
        },
        { status: 403 }
      );
    }

    if (invite.expiresAt <= now) {
      return NextResponse.json<ApiResponse<never>>(
        {
          ok: false,
          error: "Invite code expired",
        },
        { status: 403 }
      );
    }

    const pepper = process.env.INVITE_PEPPER ?? "";
    const otpHash = sha256(otp + pepper);

    if (otpHash !== invite.codeHash) {
      const nextAttempts = invite.attemptCount + 1;

      await prisma.inviteCode.update({
        where: { id: invite.id },
        data:
          nextAttempts >= 5
            ? { attemptCount: nextAttempts, lockedAt: now }
            : { attemptCount: nextAttempts },
      });

      return NextResponse.json<ApiResponse<never>>(
        {
          ok: false,
          error: "Invalid invite code",
        },
        { status: 401 }
      );
    }

    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json<ApiResponse<never>>(
        {
          ok: false,
          error: "Email already registered",
        },
        { status: 409 }
      );
    }

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

    return NextResponse.json<ApiResponse<SignupSuccess>>(
      {
        ok: true,
        data: {
          registered: true,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error(error);

    return NextResponse.json<ApiResponse<never>>(
      {
        ok: false,
        error: "Signup failed",
      },
      { status: 500 }
    );
  }
}
