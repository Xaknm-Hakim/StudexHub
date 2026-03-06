import { formatDate } from "@/src/lib/notifications/date";

type AssignmentReminderTemplateArgs = {
  studentName?: string | null;
  assignmentTitle: string;
  courseName?: string | null;
  dueDate: Date;
  appUrl: string;
  isDueToday: boolean;
};

export function buildAssignmentReminderEmail(
  args: AssignmentReminderTemplateArgs
) {
  const subject = args.isDueToday
    ? `Assignment Due Today: ${args.assignmentTitle}`
    : `Assignment Due Tomorrow: ${args.assignmentTitle}`;

  const greeting = args.studentName ? `Hi ${args.studentName},` : "Hi,";

  const dueLine = args.isDueToday
    ? `Your assignment "${args.assignmentTitle}" is due today.`
    : `Your assignment "${args.assignmentTitle}" is due tomorrow.`;

  const courseLine = args.courseName ? `Course: ${args.courseName}` : null;

  const text = [
    greeting,
    "",
    dueLine,
    `Due date: ${formatDate(args.dueDate)}`,
    courseLine,
    "",
    `Open BaruasHub: ${args.appUrl}`,
    "",
    "This is an automated reminder from BaruasHub.",
  ]
    .filter(Boolean)
    .join("\n");

  return { subject, text };
}
