import type {
  AssignmentPriority,
  AssignmentStatus,
  NotificationChannel,
  NotificationType,
} from "@/src/lib/types/enums";

export interface CreateAssignmentBody {
  title: string;
  dueDate: string;
  notes?: string;
  courseId?: string;
  priority?: AssignmentPriority;
}

export interface UpdateAssignmentBody {
  title?: string;
  dueDate?: string;
  status?: AssignmentStatus;
  priority?: AssignmentPriority;
  notes?: string | null;
  courseId?: string | null;
  completedAt?: string | null;
}

export interface CreateSemesterBody {
  slot: number;
  name: string;
  year?: number | null;
}

export interface UpdateSemesterBody {
  slot?: number;
  name?: string;
  year?: number | null;
}

export interface CreateCourseBody {
  semesterId?: string;
  semesterSlot?: number | string;
  code?: string | null;
  name: string;
  credit: number;
  mark?: number | string | null;
}

export interface UpdateCourseBody {
  semesterId?: string;
  semesterSlot?: number;
  code?: string | null;
  name?: string;
  credit?: number;
  mark?: number | string | null;
  gradePoint?: number | null;
}

export interface CreateClassScheduleBody {
  title: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  location?: string;
  isActive?: boolean;
}

export interface UpdateClassScheduleBody {
  title?: string;
  dayOfWeek?: number;
  startTime?: string;
  endTime?: string;
  location?: string | null;
  isActive?: boolean;
}

export interface CreateNotificationBody {
  type: NotificationType;
  title: string;
  message: string;
  assignmentId?: string;
  assignmentTitleSnapshot?: string;
  courseNameSnapshot?: string;
}

export interface UpdateNotificationBody {
  isRead?: boolean;
}

export interface CreateNotificationDeliveryLogBody {
  type: NotificationType;
  channel: NotificationChannel;
  notificationDate: string;
  assignmentId?: string | null;
}
