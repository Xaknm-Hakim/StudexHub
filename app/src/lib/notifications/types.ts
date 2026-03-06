import { NotificationChannel, NotificationType } from "@prisma/client";

export { NotificationChannel, NotificationType };

export type RunNotificationsResult = {
  assignmentInAppCreated: number;
  assignmentEmailsSent: number;
  classSummariesCreated: number;
  deliveryLogsDeleted: number;
};
