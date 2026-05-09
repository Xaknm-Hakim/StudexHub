import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { requireUserId } from "@/src/lib/auth";
import type { ClassScheduleRecord } from "@/src/lib/types/db";
import {
  formatClassSchedule,
  hasValidTimeRange,
  isValidDayOfWeek,
  isValidTimeString,
  schedulesOverlap,
} from "@/src/lib/class-schedule";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(req: Request, context: RouteContext) {
  const userId = await requireUserId();
  const { id } = await context.params;
  const body = await req.json();

  const existing = await prisma.classSchedule.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    return NextResponse.json({ error: "Class schedule not found." }, { status: 404 });
  }

  const title =
    body.title === undefined ? existing.title : String(body.title).trim();

  const location =
    body.location === undefined
      ? existing.location
      : body.location === null || String(body.location).trim() === ""
      ? null
      : String(body.location).trim();

  const dayOfWeek =
    body.dayOfWeek === undefined ? existing.dayOfWeek : Number(body.dayOfWeek);

  const startTime =
    body.startTime === undefined ? existing.startTime : String(body.startTime).trim();

  const endTime =
    body.endTime === undefined ? existing.endTime : String(body.endTime).trim();

  const isActive =
    body.isActive === undefined ? existing.isActive : Boolean(body.isActive);

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

  const existingSchedules: ClassScheduleRecord[] = await prisma.classSchedule.findMany({
    where: {
      userId,
      dayOfWeek,
      isActive: true,
      NOT: { id },
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

  const updated = await prisma.classSchedule.update({
    where: { id },
    data: {
      title,
      location,
      dayOfWeek,
      startTime,
      endTime,
      isActive,
    },
  });

  return NextResponse.json(formatClassSchedule(updated));
}

export async function DELETE(_: Request, context: RouteContext) {
  const userId = await requireUserId();
  const { id } = await context.params;

  const existing = await prisma.classSchedule.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    return NextResponse.json({ error: "Class schedule not found." }, { status: 404 });
  }

  await prisma.classSchedule.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}
