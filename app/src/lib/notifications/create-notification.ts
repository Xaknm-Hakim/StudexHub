import { prisma } from "@/src/lib/prisma";
import { NotificationType } from "@prisma/client";

type CreateNotificationArgs = {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  assignmentId?: string | null;
  assignmentTitleSnapshot?: string | null;
  courseNameSnapshot?: string | null;
};

export async function createNotification(args: CreateNotificationArgs) {
  return prisma.notification.create({
    data: {
      userId: args.userId,
      type: args.type,
      title: args.title,
      message: args.message,
      assignmentId: args.assignmentId ?? null,
      assignmentTitleSnapshot: args.assignmentTitleSnapshot ?? null,
      courseNameSnapshot: args.courseNameSnapshot ?? null,
    },
  });
}
