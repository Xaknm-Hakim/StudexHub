import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { verifySession } from "@/src/lib/auth";
import { SESSION_COOKIE } from "@/src/lib/cookies";
import type { ApiResponse, User } from "@/src/lib/types/api";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(SESSION_COOKIE)?.value;

    if (!token) {
      return NextResponse.json<ApiResponse<never>>(
        {
          ok: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const payload = await verifySession(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json<ApiResponse<never>>(
        {
          ok: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const responseUser: User = {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };

    return NextResponse.json<ApiResponse<User>>(
      {
        ok: true,
        data: responseUser,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error(error);

    return NextResponse.json<ApiResponse<never>>(
      {
        ok: false,
        error: "Unauthorized",
      },
      { status: 401 }
    );
  }
}
