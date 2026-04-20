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
import type { ApiResponse, ClassScheduleResponse } from "@/src/lib/types/api";
import { getErrorMessage } from "@/src/lib/types/common";

type RawClassScheduleBody = {
  title?: unknown;
  location?: unknown;
  dayOfWeek?: unknown;
  startTime?: unknown;
  endTime?: unknown;
};

export async function GET() {
  try {
    const userId = await requireUserId();

    const schedules = await prisma.classSchedule.findMany({
      where: { userId },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });

    const data: ClassScheduleResponse[] = schedules.map((schedule) =>
      formatClassSchedule(schedule)
    );

    return NextResponse.json<ApiResponse<ClassScheduleResponse[]>>(
      {
        ok: true,
        data,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = getErrorMessage(error);

    if (message === "UNAUTHORIZED") {
      return NextResponse.json<ApiResponse<never>>(
        {
          ok: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    console.error(error);

    return NextResponse.json<ApiResponse<never>>(
      {
        ok: false,
        error: "Failed to fetch class schedules",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const userId = await requireUserId();
    const body: RawClassScheduleBody = await req.json();

    const title = String(body.title ?? "").trim();
    const location =
      body.location === undefined ||
      body.location === null ||
      String(body.location).trim() === ""
        ? null
        : String(body.location).trim();

    const dayOfWeek = Number(body.dayOfWeek);
    const startTime = String(body.startTime ?? "").trim();
    const endTime = String(body.endTime ?? "").trim();

    if (!title) {
      return NextResponse.json<ApiResponse<never>>(
        {
          ok: false,
          error: "Title is required.",
        },
        { status: 400 }
      );
    }

    if (!isValidDayOfWeek(dayOfWeek)) {
      return NextResponse.json<ApiResponse<never>>(
        {
          ok: false,
          error: "Invalid dayOfWeek. Must be between 1 and 5.",
        },
        { status: 400 }
      );
    }

    if (!isValidTimeString(startTime) || !isValidTimeString(endTime)) {
      return NextResponse.json<ApiResponse<never>>(
        {
          ok: false,
          error: 'Invalid time format. Use "HH:MM".',
        },
        { status: 400 }
      );
    }

    if (!hasValidTimeRange(startTime, endTime)) {
      return NextResponse.json<ApiResponse<never>>(
        {
          ok: false,
          error: "End time must be later than start time.",
        },
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
      return NextResponse.json<ApiResponse<never>>(
        {
          ok: false,
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

    const data: ClassScheduleResponse = formatClassSchedule(schedule);

    return NextResponse.json<ApiResponse<ClassScheduleResponse>>(
      {
        ok: true,
        data,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = getErrorMessage(error);

    if (message === "UNAUTHORIZED") {
      return NextResponse.json<ApiResponse<never>>(
        {
          ok: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    console.error(error);

    return NextResponse.json<ApiResponse<never>>(
      {
        ok: false,
        error: "Failed to create class schedule",
      },
      { status: 500 }
    );
  }
}
