import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { requireUserId } from "@/src/lib/auth";
import type { ApiResponse, Notification, NotificationListData } from "@/src/lib/types/api";
import { getErrorMessage } from "@/src/lib/types/common";

function toNotificationResponse(notification: {
  id: string;
  userId: string;
  type: string;
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

export async function GET() {
  try {
    const userId = await requireUserId();

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const unreadCount = await prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });

    const data: NotificationListData = {
      notifications: notifications.map(toNotificationResponse),
      unreadCount,
    };

    return NextResponse.json<ApiResponse<NotificationListData>>(
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

    console.error("GET /api/notifications failed:", error);

    return NextResponse.json<ApiResponse<never>>(
      {
        ok: false,
        error: "Failed to fetch notifications",
      },
      { status: 500 }
    );
  }
}
