
import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { requireUserId } from "@/src/lib/auth";
import {
  formatClassSchedule,
  hasValidTimeRange,
  isValidDayOfWeek,
  isValidTimeString,
  schedulesOverlap,
} from "@/src/lib/class-schedule";

export async function GET() {
  const userId = await requireUserId();

  const schedules = await prisma.classSchedule.findMany({
    where: { userId },
    orderBy: [
      { dayOfWeek: "asc" },
      { startTime: "asc" },
    ],
  });

  return NextResponse.json(schedules.map(formatClassSchedule));
}

export async function POST(req: Request) {
  const userId = await requireUserId();
  const body = await req.json();

  const title = String(body.title ?? "").trim();
  const location =
    body.location === undefined || body.location === null || String(body.location).trim() === ""
      ? null
      : String(body.location).trim();

  const dayOfWeek = Number(body.dayOfWeek);
  const startTime = String(body.startTime ?? "").trim();
  const endTime = String(body.endTime ?? "").trim();

  if (!title) {
    return NextResponse.json({ error: "Title is required." }, { status: 400 });
  }

  if (!isValidDayOfWeek(dayOfWeek)) {
    return NextResponse.json(
      { error: "Invalid dayOfWeek. Must be between 1 and 5." },
      { status: 400 }
    );
  }

  if (!isValidTimeString(startTime) || !isValidTimeString(endTime)) {
    return NextResponse.json(
      { error: 'Invalid time format. Use "HH:MM".' },
      { status: 400 }
    );
  }

  if (!hasValidTimeRange(startTime, endTime)) {
    return NextResponse.json(
      { error: "End time must be later than start time." },
      { status: 400 }
    );
  }

  const existingSchedules = await prisma.classSchedule.findMany({
    where: {
      userId,
      dayOfWeek,
      isActive: true,
    },
  });

  const conflict = existingSchedules.find((schedule) =>
    schedulesOverlap(startTime, endTime, schedule.startTime, schedule.endTime)
  );

  if (conflict) {
    return NextResponse.json(
      {
        error: `This class overlaps with "${conflict.title}" (${conflict.startTime} - ${conflict.endTime}).`,
      },
      { status: 409 }
    );
  }

  const schedule = await prisma.classSchedule.create({
    data: {
      userId,
      title,
      dayOfWeek,
      startTime,
      endTime,
      location,
    },
  });

  return NextResponse.json(formatClassSchedule(schedule), { status: 201 });
}
