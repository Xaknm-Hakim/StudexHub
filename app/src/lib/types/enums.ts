export type AssignmentStatus = "PENDING" | "DONE";
export type AssignmentPriority = "LOW" | "MEDIUM" | "HIGH";

export type NotificationType =
  | "ASSIGNMENT_DUE_TOMORROW"
  | "ASSIGNMENT_DUE_TODAY"
  | "CLASS_TOMORROW_SUMMARY";

export type NotificationChannel = "IN_APP" | "EMAIL";
