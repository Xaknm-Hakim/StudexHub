import fs from "node:fs/promises";
import path from "node:path";

export type NoticeRecipientResult = {
  name: string | null;
  email: string | null;
  status: "sent" | "no_email" | "failed";
  error?: string;
};

type WriteNoticeLogInput = {
  mode: "test" | "broadcast";
  template: string;
  totalUsers: number;
  sent: number;
  noEmail: number;
  failed: number;
  details: NoticeRecipientResult[];
};

const NOTICE_LOG_DIR = path.join(process.cwd(), "infra", "notices-logs");

function sanitizeFilePart(value: string): string {
  return value
    .replace(/\.txt$/i, "")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_+/g, "_");
}

function displayName(name: string | null): string {
  const trimmed = name?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : "Unknown User";
}

function displayUser(name: string | null, email: string | null): string {
  const safeName = displayName(name);
  return email ? `${safeName} <${email}>` : safeName;
}

export async function writeNoticeLog(
  input: WriteNoticeLogInput
): Promise<{ fullPath: string; filename: string }> {
  await fs.mkdir(NOTICE_LOG_DIR, { recursive: true });

  const timestamp = new Date().toISOString();
  const safeTimestamp = timestamp.replace(/:/g, "-");
  const safeTemplate = sanitizeFilePart(input.template);

  const filename = `${safeTimestamp}_${input.mode}_${safeTemplate}.txt`;
  const fullPath = path.join(NOTICE_LOG_DIR, filename);

  const sentUsers = input.details.filter((item) => item.status === "sent");
  const noEmailUsers = input.details.filter((item) => item.status === "no_email");
  const failedUsers = input.details.filter((item) => item.status === "failed");

  const lines: string[] = [
    "==================================================",
    "StudexHub Notice Execution Log",
    "==================================================",
    "",
    `Timestamp: ${timestamp}`,
    `Mode: ${input.mode}`,
    `Template: ${input.template}`,
    "",
    "Summary",
    "-------",
    `Total users processed: ${input.totalUsers}`,
    `Sent: ${input.sent}`,
    `No email: ${input.noEmail}`,
    `Failed: ${input.failed}`,
    "",
    "Sent Users",
    "----------",
    ...(sentUsers.length > 0
      ? sentUsers.map((user) => `- ${displayUser(user.name, user.email)}`)
      : ["- None"]),
    "",
    "Users With No Email",
    "-------------------",
    ...(noEmailUsers.length > 0
      ? noEmailUsers.map((user) => `- ${displayUser(user.name, null)}`)
      : ["- None"]),
    "",
    "Failed Deliveries",
    "-----------------",
    ...(failedUsers.length > 0
      ? failedUsers.map(
          (user) =>
            `- ${displayUser(user.name, user.email)} — ${user.error || "Unknown error"}`
        )
      : ["- None"]),
    "",
  ];

  await fs.writeFile(fullPath, lines.join("\n"), "utf8");

  return { fullPath, filename };
}
