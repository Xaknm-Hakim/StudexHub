import { NextResponse } from "next/server";
import { SESSION_COOKIE, cookieOptions } from "@/src/lib/cookies";
import type { ApiResponse } from "@/src/lib/types/api";

interface LogoutSuccess {
  loggedOut: true;
}

export async function POST() {
  const res = NextResponse.json<ApiResponse<LogoutSuccess>>(
    {
      ok: true,
      data: {
        loggedOut: true,
      },
    },
    { status: 200 }
  );

  res.cookies.set(SESSION_COOKIE, "", {
    ...cookieOptions(),
    maxAge: 0,
  });

  return res;
}
