import { prisma } from "@/src/lib/prisma";
import { createNotification } from "@/src/lib/notifications/create-notification";
import {
  createDeliveryLog,
  hasDeliveryLog,
} from "@/src/lib/notifications/delivery-log";
import { addDays, startOfLocalDay } from "@/src/lib/notifications/date";
import { NotificationChannel, NotificationType } from "@prisma/client";

export async function runClassReminders() {
  const today = startOfLocalDay();
  const tomorrow = addDays(today, 1);

  let classSummariesCreated = 0;

  // JS Date.getDay():
  // Sunday=0, Monday=1, Tuesday=2, ..., Saturday=6
  // Your schema:
  // Monday=1 ... Friday=5
  const tomorrowDayOfWeek = tomorrow.getDay();

  const schedules = await prisma.classSchedule.findMany({
    where: {
      isActive: true,
      dayOfWeek: tomorrowDayOfWeek,
    },
    include: {
      user: {
        select: {
          id: true,
        },
      },
    },
    orderBy: {
      startTime: "asc",
    },
  });

  const grouped = new Map<
    string,
    Array<{ title: string; startTime: string; endTime: string; location: string | null }>
  >();

  for (const schedule of schedules) {
    const list = grouped.get(schedule.userId) ?? [];
    list.push({
      title: schedule.title,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      location: schedule.location,
    });
    grouped.set(schedule.userId, list);
  }

  for (const [userId, classes] of grouped.entries()) {
    const alreadySent = await hasDeliveryLog({
      userId,
      type: NotificationType.CLASS_TOMORROW_SUMMARY,
      channel: NotificationChannel.IN_APP,
      notificationDate: today,
      assignmentId: null,
    });

    if (alreadySent) continue;

    const classText = classes
      .map((item) => {
        const base = `${item.title} at ${item.startTime}`;
        return item.location ? `${base} (${item.location})` : base;
      })
      .join(", ");

    const title = "Tomorrow's Classes";
    const message =
      classes.length === 1
        ? `You have 1 class tomorrow: ${classText}.`
        : `You have ${classes.length} classes tomorrow: ${classText}.`;

    await createNotification({
      userId,
      type: NotificationType.CLASS_TOMORROW_SUMMARY,
      title,
      message,
    });

    await createDeliveryLog({
      userId,
      type: NotificationType.CLASS_TOMORROW_SUMMARY,
      channel: NotificationChannel.IN_APP,
      notificationDate: today,
      assignmentId: null,
    });

    classSummariesCreated += 1;
  }

  return { classSummariesCreated };
}
