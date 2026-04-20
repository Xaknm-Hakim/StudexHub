import { NextResponse } from "next/server";
import { requireUserId } from "@/src/lib/auth";
import { SEMESTER_OPTIONS } from "@/src/lib/semester";
import type { ApiResponse } from "@/src/lib/types/api";
import { getErrorMessage } from "@/src/lib/types/common";

export async function GET() {
  try {
    await requireUserId();

    return NextResponse.json<ApiResponse<typeof SEMESTER_OPTIONS>>(
      {
        ok: true,
        data: SEMESTER_OPTIONS,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = getErrorMessage(error);

    if (message === "UNAUTHORIZED") {
      return NextResponse.json<ApiResponse<never>>(
        {
          ok: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    console.error(error);

    return NextResponse.json<ApiResponse<never>>(
      {
        ok: false,
        error: "Failed to fetch semesters",
      },
      { status: 500 }
    );
  }
}
