import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function GET(req: Request) {
  const secret = req.headers.get("x-internal-cron-secret");

  if (!process.env.INTERNAL_CRON_SECRET) {
    return NextResponse.json(
      { ok: false, error: "INTERNAL_CRON_SECRET is not configured" },
      { status: 500 }
    );
  }

  if (secret !== process.env.INTERNAL_CRON_SECRET) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const checks = {
    app: true,
    db: false,
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.db = true;
  } catch (error) {
    console.error("Health check DB error:", error);
  }

  const ok = checks.app && checks.db;

  return NextResponse.json(
    {
      ok,
      service: "StudexHub",
      timestamp: new Date().toISOString(),
      checks,
    },
    { status: ok ? 200 : 503 }
  );
}
