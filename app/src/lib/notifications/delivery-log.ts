import { prisma } from "@/src/lib/prisma";
import { NotificationChannel, NotificationType } from "@prisma/client";

type HasSentArgs = {
  userId: string;
  type: NotificationType;
  channel: NotificationChannel;
  notificationDate: Date;
  assignmentId?: string | null;
};

type CreateLogArgs = HasSentArgs;

export async function hasDeliveryLog(args: HasSentArgs) {
  const existing = await prisma.notificationDeliveryLog.findFirst({
    where: {
      userId: args.userId,
      type: args.type,
      channel: args.channel,
      notificationDate: args.notificationDate,
      assignmentId: args.assignmentId ?? null,
    },
    select: { id: true },
  });

  return Boolean(existing);
}

export async function createDeliveryLog(args: CreateLogArgs) {
  return prisma.notificationDeliveryLog.create({
    data: {
      userId: args.userId,
      type: args.type,
      channel: args.channel,
      notificationDate: args.notificationDate,
      assignmentId: args.assignmentId ?? null,
    },
  });
}

export async function cleanupOldDeliveryLogs() {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 2);

  const result = await prisma.notificationDeliveryLog.deleteMany({
    where: {
      createdAt: {
        lt: cutoff,
      },
    },
  });

  return result.count;
}
