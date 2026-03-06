import { NextRequest, NextResponse } from "next/server";
import { runAssignmentReminders } from "@/src/lib/notifications/assignment-reminders";
import { runClassReminders } from "@/src/lib/notifications/class-reminders";
import { cleanupOldDeliveryLogs } from "@/src/lib/notifications/delivery-log";

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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const assignment = await runAssignmentReminders();
    const classes = await runClassReminders();
    const deleted = await cleanupOldDeliveryLogs();

    return NextResponse.json({
      ok: true,
      assignmentInAppCreated: assignment.inAppCreated,
      assignmentEmailsSent: assignment.emailsSent,
      assignmentEmailFailures: assignment.emailFailures,
      classSummariesCreated: classes.classSummariesCreated,
      deliveryLogsDeleted: deleted,
    });
  } catch (error) {
    console.error("Notification cron failed:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Failed to run notifications",
      },
      { status: 500 }
    );
  }
}
