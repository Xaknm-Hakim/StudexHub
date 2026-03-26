import { prisma } from "@/src/lib/prisma";
import { sendEmail } from "@/src/lib/gmail/send-email";
import { readNoticeTemplate } from "@/src/lib/notices";
import {
  type NoticeRecipientResult,
  writeNoticeLog,
} from "@/src/lib/notice-logger";

type SendNoticeOptions = {
  testEmail?: string;
  testName?: string;
};

export type SendNoticeResult = {
  mode: "test" | "broadcast";
  template: string;
  totalUsers: number;
  sent: number;
  noEmail: number;
  failed: number;
  details: NoticeRecipientResult[];
  logFilename: string;
  logPath: string;
};

function uniqueUsersByEmail<T extends { email: string | null }>(users: T[]): T[] {
  const seen = new Set<string>();
  const result: T[] = [];

  for (const user of users) {
    const email = user.email?.trim().toLowerCase();

    if (!email) {
      continue;
    }

    if (!seen.has(email)) {
      seen.add(email);
      result.push(user);
    }
  }

  return result;
}

export async function sendNoticeToAllUsers(
  filename: string,
  options?: SendNoticeOptions
): Promise<SendNoticeResult> {
  const templateBody = await readNoticeTemplate(filename);
  const isTest = Boolean(options?.testEmail);
  const mode: "test" | "broadcast" = isTest ? "test" : "broadcast";

  const details: NoticeRecipientResult[] = [];

  if (isTest) {
    const adminEmail = options?.testEmail?.trim();
    const adminName = options?.testName?.trim() || "Admin";

    if (!adminEmail) {
      throw new Error("ADMIN_EMAIL is required for test mode.");
    }

    try {
      await sendEmail({
        to: adminEmail,
        subject: `[Notice Test] ${filename.replace(/\.txt$/i, "")}`,
        text: templateBody,
      });

      details.push({
        name: adminName,
        email: adminEmail,
        status: "sent",
      });
    } catch (error) {
      details.push({
        name: adminName,
        email: adminEmail,
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  } else {
    const users = await prisma.user.findMany({
      select: {
        name: true,
        email: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    const usersWithoutEmail = users.filter(
      (user) => !user.email || !user.email.trim()
    );

    const usersWithEmail = uniqueUsersByEmail(
      users.map((user) => ({
        name: user.name,
        email: user.email?.trim() || null,
      }))
    );

    for (const user of usersWithoutEmail) {
      details.push({
        name: user.name,
        email: null,
        status: "no_email",
      });
    }

    for (const user of usersWithEmail) {
      const email = user.email?.trim() || null;

      if (!email) {
        details.push({
          name: user.name,
          email: null,
          status: "no_email",
        });
        continue;
      }

      try {
        await sendEmail({
          to: email,
          subject: filename.replace(/\.txt$/i, ""),
          text: templateBody,
        });

        details.push({
          name: user.name,
          email,
          status: "sent",
        });
      } catch (error) {
        details.push({
          name: user.name,
          email,
          status: "failed",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  }

  const sent = details.filter((item) => item.status === "sent").length;
  const noEmail = details.filter((item) => item.status === "no_email").length;
  const failed = details.filter((item) => item.status === "failed").length;
  const totalUsers = details.length;

  const log = await writeNoticeLog({
    mode,
    template: filename,
    totalUsers,
    sent,
    noEmail,
    failed,
    details,
  });

  return {
    mode,
    template: filename,
    totalUsers,
    sent,
    noEmail,
    failed,
    details,
    logFilename: log.filename,
    logPath: log.fullPath,
  };
}
