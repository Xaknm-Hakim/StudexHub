export type Notification = {
  id: string
  userId: string
  type: "ASSIGNMENT_DUE_TOMORROW" | "ASSIGNMENT_DUE_TODAY" | "CLASS_TOMORROW_SUMMARY"
  title: string
  message: string
  isRead: boolean
  assignmentId?: string | null
  assignmentTitleSnapshot?: string | null
  courseNameSnapshot?: string | null
  createdAt: string
}