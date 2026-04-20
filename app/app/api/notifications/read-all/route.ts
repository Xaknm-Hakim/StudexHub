import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { requireUserId } from "@/src/lib/auth";
import type { ApiResponse } from "@/src/lib/types/api";
import { getErrorMessage } from "@/src/lib/types/common";

interface MarkAllNotificationsReadResult {
  updatedCount: number;
}

export async function PATCH() {
  try {
    const userId = await requireUserId();

    const result = await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return NextResponse.json<ApiResponse<MarkAllNotificationsReadResult>>(
      {
        ok: true,
        data: {
          updatedCount: result.count,
        },
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

    console.error("PATCH /api/notifications/read-all failed:", error);

    return NextResponse.json<ApiResponse<never>>(
      {
        ok: false,
        error: "Failed to mark all notifications as read",
      },
      { status: 500 }
    );
  }
}
