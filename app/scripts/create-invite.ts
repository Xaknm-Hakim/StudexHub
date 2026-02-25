import "dotenv/config";
import crypto from "crypto";
import { prisma } from "../src/lib/prisma";

function sha256(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

function randomFrom(chars: string, len: number) {
  let out = "";
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

async function main() {
  const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  // Public identifier (for tracking attempts)
  const codeId = randomFrom(CHARS, 6);

  // Secret OTP (what user must know)
  const otp = randomFrom(CHARS, 12);

  // User-facing code
  const fullCode = `${codeId}-${otp}`;

  // Store only hash of OTP and PEPPER
  const pepper = process.env.INVITE_PEPPER ?? "";
  const codeHash = sha256(otp + pepper);

  // 24 hours expiry
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.inviteCode.create({
    data: {
      codeId,
      codeHash,
      expiresAt,
      attemptCount: 0,
    },
  });

  console.log("Invite code (send this to the person):", fullCode);
  console.log("Expires at:", expiresAt.toISOString());
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
