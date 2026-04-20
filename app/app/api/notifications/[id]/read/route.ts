import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { requireUserId } from "@/src/lib/auth";
import type { ApiResponse, Notification } from "@/src/lib/types/api";
import { getErrorMessage } from "@/src/lib/types/common";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function toNotificationResponse(notification: {
  id: string;
  userId: string;
  type: Notification["type"];
  title: string;
  message: string;
  isRead: boolean;
  assignmentId: string | null;
  assignmentTitleSnapshot: string | null;
  courseNameSnapshot: string | null;
  createdAt: Date;
}): Notification {
  return {
    id: notification.id,
    userId: notification.userId,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    isRead: notification.isRead,
    assignmentId: notification.assignmentId,
    assignmentTitleSnapshot: notification.assignmentTitleSnapshot,
    courseNameSnapshot: notification.courseNameSnapshot,
    createdAt: notification.createdAt.toISOString(),
  };
}

export async function PATCH(_request: NextRequest, context: RouteContext) {
  try {
    const userId = await requireUserId();
    const { id } = await context.params;

    const notification = await prisma.notification.findFirst({
      where: {
        id,
        userId,
      },
      select: { id: true },
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

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    const data: Notification = toNotificationResponse(updated);

    return NextResponse.json<ApiResponse<Notification>>(
      {
        ok: true,
        data,
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

    console.error(
      "PATCH /api/notifications/[id]/read failed:",
      error
    );

    return NextResponse.json<ApiResponse<never>>(
      {
        ok: false,
        error: "Failed to mark notification as read",
      },
      { status: 500 }
    );
  }
}
