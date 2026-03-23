import { sendNoticeToAllUsers } from "@/src/lib/send-notice";

function formatUser(name: string | null, email: string | null): string {
  const safeName = name?.trim() ? name.trim() : "Unknown User";
  return email ? `${safeName} <${email}>` : safeName;
}

async function main() {
  const templateName = process.argv[2];
  const isTest = process.argv.includes("--test");

  if (!templateName) {
    throw new Error("Usage: npx tsx scripts/send-notice.ts <filename> [--test]");
  }

  const result = await sendNoticeToAllUsers(templateName, {
    testEmail: isTest ? process.env.ADMIN_EMAIL : undefined,
    testName: "Admin",
  });

  const noEmailUsers = result.details.filter((item) => item.status === "no_email");
  const failedUsers = result.details.filter((item) => item.status === "failed");

  const lines: string[] = [
    isTest ? "Test notice completed" : "Notice broadcast completed",
    "",
    `Template: ${result.template}`,
    `Total users processed: ${result.totalUsers}`,
    `Sent: ${result.sent}`,
    `No email: ${result.noEmail}`,
    `Failed: ${result.failed}`,
    "",
    "Users with no email:",
    ...(noEmailUsers.length > 0
      ? noEmailUsers.map((user) => `- ${formatUser(user.name, null)}`)
      : ["- None"]),
    "",
    "Failed deliveries:",
    ...(failedUsers.length > 0
      ? failedUsers.map(
          (user) =>
            `- ${formatUser(user.name, user.email)} — ${
              user.error || "Unknown error"
            }`
        )
      : ["- None"]),
    "",
    `Log file: ${result.logFilename}`,
    `Log path: ${result.logPath}`,
  ];

  console.log(lines.join("\n"));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Unknown error");
  process.exit(1);
});
