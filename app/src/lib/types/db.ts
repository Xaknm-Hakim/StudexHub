import type {
  AssignmentPriority,
  AssignmentStatus,
  NotificationChannel,
  NotificationType,
} from "@/src/lib/types/enums";

export interface UserRecord {
  id: string;
  email: string;
  name: string | null;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SemesterRecord {
  id: string;
  userId: string;
  slot: number;
  name: string;
  year: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CourseRecord {
  id: string;
  semesterId: string;
  code: string | null;
  name: string;
  credit: number;
  mark: number | null;
  gradePoint: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AssignmentRecord {
  id: string;
  userId: string;
  courseId: string | null;
  title: string;
  dueDate: Date;
  status: AssignmentStatus;
  priority: AssignmentPriority;
  notes: string | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface InviteCodeRecord {
  id: string;
  codeId: string;
  codeHash: string;
  attemptCount: number;
  createdAt: Date;
  expiresAt: Date;
  usedAt: Date | null;
  lockedAt: Date | null;
}

export interface ClassScheduleRecord {
  id: string;
  userId: string;
  title: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  location: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationRecord {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  assignmentId: string | null;
  assignmentTitleSnapshot: string | null;
  courseNameSnapshot: string | null;
  createdAt: Date;
}

export interface NotificationDeliveryLogRecord {
  id: string;
  userId: string;
  type: NotificationType;
  channel: NotificationChannel;
  notificationDate: Date;
  assignmentId: string | null;
  createdAt: Date;
}
