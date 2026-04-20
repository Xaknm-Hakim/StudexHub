import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/src/lib/prisma";
import { signSession } from "@/src/lib/auth";
import { SESSION_COOKIE, cookieOptions } from "@/src/lib/cookies";
import type { ApiResponse } from "@/src/lib/types/api";
import { getErrorMessage } from "@/src/lib/types/common";

interface LoginSuccess {
  authenticated: true;
}

export async function POST(req: Request) {
  try {
    const body: unknown = await req.json();

    const emailRaw =
      typeof body === "object" && body !== null && "email" in body
        ? String(body.email ?? "").trim()
        : "";

    const password =
      typeof body === "object" && body !== null && "password" in body
        ? String(body.password ?? "")
        : "";

    if (!emailRaw || !password) {
      return NextResponse.json<ApiResponse<never>>(
        {
          ok: false,
          error: "email and password are required",
        },
        { status: 400 }
      );
    }

    const email = emailRaw.toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json<ApiResponse<never>>(
        {
          ok: false,
          error: "Invalid credentials",
        },
        { status: 401 }
      );
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      return NextResponse.json<ApiResponse<never>>(
        {
          ok: false,
          error: "Invalid credentials",
        },
        { status: 401 }
      );
    }

    const token = await signSession({
      sub: user.id,
      email: user.email,
      name: user.name ?? null,
    });

    const response = NextResponse.json<ApiResponse<LoginSuccess>>(
      {
        ok: true,
        data: {
          authenticated: true,
        },
      },
      { status: 200 }
    );

    response.cookies.set(SESSION_COOKIE, token, {
      ...cookieOptions(),
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error: unknown) {
    console.error(error);

    return NextResponse.json<ApiResponse<never>>(
      {
        ok: false,
        error: "Login failed",
      },
      { status: 500 }
    );
  }
}
