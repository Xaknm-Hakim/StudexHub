import { prisma } from "@/src/lib/prisma";
import { createNotification } from "@/src/lib/notifications/create-notification";
import {
  createDeliveryLog,
  hasDeliveryLog,
} from "@/src/lib/notifications/delivery-log";
import { addDays, startOfLocalDay } from "@/src/lib/notifications/date";
import {
  AssignmentStatus,
  NotificationChannel,
  NotificationType,
} from "@prisma/client";
import { buildAssignmentReminderEmail } from "@/src/lib/gmail/templates";
import { sendEmail } from "@/src/lib/gmail/send-email";

function isGmailConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      process.env.GOOGLE_REDIRECT_URI &&
      process.env.GOOGLE_REFRESH_TOKEN &&
      process.env.GMAIL_SENDER_EMAIL
  );
}

export async function runAssignmentReminders() {
  const today = startOfLocalDay();
  const tomorrow = addDays(today, 1);
  const dayAfterTomorrow = addDays(today, 2);
  const gmailReady = isGmailConfigured();

  let inAppCreated = 0;
  let emailsSent = 0;
  let emailFailures = 0;

  const assignments = await prisma.assignment.findMany({
    where: {
      status: AssignmentStatus.PENDING,
      dueDate: {
        gte: today,
        lt: dayAfterTomorrow,
      },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      course: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      dueDate: "asc",
    },
  });

  for (const assignment of assignments) {
    try {
      const dueDay = startOfLocalDay(assignment.dueDate);

      const isDueToday = dueDay.getTime() === today.getTime();
      const isDueTomorrow = dueDay.getTime() === tomorrow.getTime();

      if (!isDueToday && !isDueTomorrow) {
        continue;
      }

      const type = isDueToday
        ? NotificationType.ASSIGNMENT_DUE_TODAY
        : NotificationType.ASSIGNMENT_DUE_TOMORROW;

      const title = isDueToday
        ? "Assignment Due Today"
        : "Assignment Due Tomorrow";

      const message = isDueToday
        ? `Your assignment "${assignment.title}" is due today.`
        : `Your assignment "${assignment.title}" is due tomorrow.`;

      const inAppAlreadySent = await hasDeliveryLog({
        userId: assignment.userId,
        type,
        channel: NotificationChannel.IN_APP,
        notificationDate: today,
        assignmentId: assignment.id,
      });

      if (!inAppAlreadySent) {
        await createNotification({
          userId: assignment.userId,
          type,
          title,
          message,
          assignmentId: assignment.id,
          assignmentTitleSnapshot: assignment.title,
          courseNameSnapshot: assignment.course?.name ?? null,
        });

        await createDeliveryLog({
          userId: assignment.userId,
          type,
          channel: NotificationChannel.IN_APP,
          notificationDate: today,
          assignmentId: assignment.id,
        });

        inAppCreated += 1;
      }

      const recipientEmail = assignment.user.email?.trim();

      if (!gmailReady || !recipientEmail) {
        continue;
      }

      const emailAlreadySent = await hasDeliveryLog({
        userId: assignment.userId,
        type,
        channel: NotificationChannel.EMAIL,
        notificationDate: today,
        assignmentId: assignment.id,
      });

      if (emailAlreadySent) {
        continue;
      }

      const appUrl = process.env.APP_URL ?? "http://localhost:3000";

      const email = buildAssignmentReminderEmail({
        studentName: assignment.user.name,
        assignmentTitle: assignment.title,
        courseName: assignment.course?.name ?? null,
        dueDate: assignment.dueDate,
        appUrl,
        isDueToday,
      });

      try {
        await sendEmail({
          to: recipientEmail,
          subject: email.subject,
          text: email.text,
        });

        await createDeliveryLog({
          userId: assignment.userId,
          type,
          channel: NotificationChannel.EMAIL,
          notificationDate: today,
          assignmentId: assignment.id,
        });

        emailsSent += 1;
      } catch (error) {
        emailFailures += 1;

        console.error("Failed to send assignment reminder email:", {
          assignmentId: assignment.id,
          userId: assignment.userId,
          recipientEmail,
          error,
        });
      }
    } catch (error) {
      console.error("Failed to process assignment reminder:", {
        assignmentId: assignment.id,
        userId: assignment.userId,
        error,
      });
    }
  }

  return {
    inAppCreated,
    emailsSent,
    emailFailures,
  };
}
