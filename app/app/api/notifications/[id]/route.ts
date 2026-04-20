import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { requireUserId } from "@/src/lib/auth";
import type { ApiResponse } from "@/src/lib/types/api";
import { getErrorMessage } from "@/src/lib/types/common";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type DeleteNotificationResult = {
  id: string;
};

export async function DELETE(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const userId = await requireUserId();
    const { id } = await context.params;

    const notification = await prisma.notification.findFirst({
      where: {
        id,
        userId,
      },
      select: {
        id: true,
      },
    });

    if (!notification) {
      return NextResponse.json<ApiResponse<never>>(
        {
          ok: false,
          error: "Notification not found",
        },
        { status: 404 }
      );
    }

    await prisma.notification.delete({
      where: {
        id,
      },
    });

    return NextResponse.json<ApiResponse<DeleteNotificationResult>>(
      {
        ok: true,
        data: { id },
        message: "Notification deleted successfully",
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

    console.error("DELETE notification failed:", error);

    return NextResponse.json<ApiResponse<never>>(
      {
        ok: false,
        error: "Failed to delete notification",
      },
      { status: 500 }
    );
  }
}
