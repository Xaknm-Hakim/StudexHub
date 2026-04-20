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
  ok: true;
  data: T;
  message?: string;
}

export interface ApiError {
  ok: false;
  error: string;
  details?: unknown;
}

export interface CourseSemesterSummary {
  id: string;
  slot: number;
  name: string;
}

export interface CourseWithSemester extends Course {
  semester: CourseSemesterSummary;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export interface AssignmentCourseSummary {
  id: string;
  name: string;
  code: string | null;
  credit: number;
}

export type AssignmentDueStatus = "OVERDUE" | "DUE_TODAY" | "DUE_IN_X_DAYS";

export interface AssignmentWithMeta extends Assignment {
  daysLeft: number;
  dueStatus: AssignmentDueStatus;
  course: AssignmentCourseSummary | null;
}

export interface NotificationListData {
  notifications: Notification[];
  unreadCount: number;
}

export interface ClassScheduleResponse {
  id: string;
  title: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  location: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HealthChecks {
  app: boolean;
  db: boolean;
}

export interface InternalHealthResponse {
  service: string;
  timestamp: string;
  checks: HealthChecks;
}

export interface AcademicSemesterStat {
  semesterId: string;
  name: string;
  year: number | null;
  gpa: number | null;
  credits: number;
}

export interface AcademicSummaryResponse {
  cgpa: number | null;
  totalCredits: number;
  semesterStats: AcademicSemesterStat[];
}

export interface SemesterGpaResponse {
  semesterId: string;
  semesterName: string;
  gpa: number | null;
  totalCredits: number;
  countedCourses: number;
  totalCourses: number;
}

export interface InternalNotificationsRunResponse {
  assignmentInAppCreated: number;
  assignmentEmailsSent: number;
  assignmentEmailFailures: number;
  classSummariesCreated: number;
  deliveryLogsDeleted: number;
}

export type InternalNotificationsRunApiResponse = ApiResponse<InternalNotificationsRunResponse>;
export type SemesterGpaApiResponse = ApiResponse<SemesterGpaResponse>;
export type AcademicSummaryApiResponse = ApiResponse<AcademicSummaryResponse>;
export type InternalHealthApiResponse = ApiResponse<InternalHealthResponse>;
export type ClassScheduleListResponse = ApiResponse<ClassScheduleResponse[]>;
export type ClassScheduleSingleResponse = ApiResponse<ClassScheduleResponse>;
export type NotificationListWithCountResponse = ApiResponse<NotificationListData>;
export type AssignmentWithMetaListResponse = ApiResponse<AssignmentWithMeta[]>;
export type AssignmentWithMetaSingleResponse = ApiResponse<AssignmentWithMeta>;
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
export type CourseWithSemesterListResponse = ApiResponse<CourseWithSemester[]>;
export type CourseWithSemesterSingleResponse = ApiResponse<CourseWithSemester>;
