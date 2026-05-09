import { getGmailClient } from "@/src/lib/gmail/client";

type SendEmailArgs = {
  to: string;
  subject: string;
  text: string;
};

function toBase64Url(input: string) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export async function sendEmail(args: SendEmailArgs) {
  const from = process.env.GMAIL_SENDER_EMAIL;
  if (!from) {
    throw new Error("Missing required env var: GMAIL_SENDER_EMAIL");
  }

  const gmail = getGmailClient();

  const mime = [
    `From: StudexHub <${from}>`,
    `To: ${args.to}`,
    `Subject: ${args.subject}`,
    "MIME-Version: 1.0",
    'Content-Type: text/plain; charset="UTF-8"',
    "",
    args.text,
  ].join("\n");

  const raw = toBase64Url(mime);

  console.log("Sending email to:", JSON.stringify(args.to));

  await gmail.users.messages.send({
    userId: "me",
    requestBody: { raw },
  });
}
