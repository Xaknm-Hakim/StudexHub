import { NextRequest, NextResponse } from "next/server";
import { runAssignmentReminders } from "@/src/lib/notifications/assignment-reminders";
import { runClassReminders } from "@/src/lib/notifications/class-reminders";
import { cleanupOldDeliveryLogs } from "@/src/lib/notifications/delivery-log";
import type {
  ApiResponse,
  InternalNotificationsRunResponse,
} from "@/src/lib/types/api";
import { getErrorMessage } from "@/src/lib/types/common";

function isAuthorized(request: NextRequest) {
  const expected = process.env.INTERNAL_CRON_SECRET;

  if (!expected) {
    throw new Error("Missing INTERNAL_CRON_SECRET");
  }

  const received = request.headers.get("x-internal-cron-secret");
  return received === expected;
}

export async function POST(request: NextRequest) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json<ApiResponse<never>>(
        {
          ok: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const assignment = await runAssignmentReminders();
    const classes = await runClassReminders();
    const deleted = await cleanupOldDeliveryLogs();

    const data: InternalNotificationsRunResponse = {
      assignmentInAppCreated: assignment.inAppCreated,
      assignmentEmailsSent: assignment.emailsSent,
      assignmentEmailFailures: assignment.emailFailures,
      classSummariesCreated: classes.classSummariesCreated,
      deliveryLogsDeleted: deleted,
    };

    return NextResponse.json<ApiResponse<InternalNotificationsRunResponse>>(
      {
        ok: true,
        data,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = getErrorMessage(error);

    console.error("Notification cron failed:", error);

    if (message === "Missing INTERNAL_CRON_SECRET") {
      return NextResponse.json<ApiResponse<never>>(
        {
          ok: false,
          error: "INTERNAL_CRON_SECRET is not configured",
        },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse<never>>(
      {
        ok: false,
        error: "Failed to run notifications",
      },
      { status: 500 }
    );
  }
}
