import type {
  AssignmentPriority,
  AssignmentStatus,
  NotificationChannel,
  NotificationType,
} from "@/src/lib/types/enums";

export interface User {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Semester {
  id: string;
  userId: string;
  slot: number;
  name: string;
  year: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  id: string;
  semesterId: string;
  code: string | null;
  name: string;
  credit: number;
  mark: number | null;
  gradePoint: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface Assignment {
  id: string;
  userId: string;
  courseId: string | null;
  title: string;
  dueDate: string;
  status: AssignmentStatus;
  priority: AssignmentPriority;
  notes: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InviteCode {
  id: string;
  codeId: string;
  attemptCount: number;
  createdAt: string;
  expiresAt: string;
  usedAt: string | null;
  lockedAt: string | null;
}

export interface ClassSchedule {
  id: string;
  userId: string;
  title: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  location: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  assignmentId: string | null;
  assignmentTitleSnapshot: string | null;
  courseNameSnapshot: string | null;
  createdAt: string;
}

export interface NotificationDeliveryLog {
  id: string;
  userId: string;
  type: NotificationType;
  channel: NotificationChannel;
  notificationDate: string;
  assignmentId: string | null;
  createdAt: string;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: string;
  details?: unknown;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export type AssignmentListResponse = ApiResponse<Assignment[]>;
export type AssignmentSingleResponse = ApiResponse<Assignment>;
export type CourseListResponse = ApiResponse<Course[]>;
export type CourseSingleResponse = ApiResponse<Course>;
export type SemesterListResponse = ApiResponse<Semester[]>;
export type SemesterSingleResponse = ApiResponse<Semester>;
export type ClassScheduleListResponse = ApiResponse<ClassSchedule[]>;
export type ClassScheduleSingleResponse = ApiResponse<ClassSchedule>;
export type NotificationListResponse = ApiResponse<Notification[]>;
export type NotificationSingleResponse = ApiResponse<Notification>;
