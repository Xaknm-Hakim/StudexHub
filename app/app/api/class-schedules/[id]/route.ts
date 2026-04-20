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
import type {
  ApiResponse,
  ClassScheduleResponse,
} from "@/src/lib/types/api";
import { getErrorMessage } from "@/src/lib/types/common";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type RawClassSchedulePatchBody = {
  title?: unknown;
  location?: unknown;
  dayOfWeek?: unknown;
  startTime?: unknown;
  endTime?: unknown;
  isActive?: unknown;
};

type DeleteClassScheduleResult = {
  id: string;
};

export async function PATCH(req: Request, context: RouteContext) {
  try {
    const userId = await requireUserId();
    const { id } = await context.params;
    const body: RawClassSchedulePatchBody = await req.json();

    const existing = await prisma.classSchedule.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return NextResponse.json<ApiResponse<never>>(
        {
          ok: false,
          error: "Class schedule not found.",
        },
        { status: 404 }
      );
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
      body.startTime === undefined
        ? existing.startTime
        : String(body.startTime).trim();

    const endTime =
      body.endTime === undefined ? existing.endTime : String(body.endTime).trim();

    const isActive =
      body.isActive === undefined ? existing.isActive : Boolean(body.isActive);

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
        NOT: { id },
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

    const data: ClassScheduleResponse = formatClassSchedule(updated);

    return NextResponse.json<ApiResponse<ClassScheduleResponse>>(
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
        error: "Failed to update class schedule",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  try {
    const userId = await requireUserId();
    const { id } = await context.params;

    const existing = await prisma.classSchedule.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return NextResponse.json<ApiResponse<never>>(
        {
          ok: false,
          error: "Class schedule not found.",
        },
        { status: 404 }
      );
    }

    await prisma.classSchedule.delete({
      where: { id },
    });

    return NextResponse.json<ApiResponse<DeleteClassScheduleResult>>(
      {
        ok: true,
        data: { id },
        message: "Class schedule deleted successfully",
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
        error: "Failed to delete class schedule",
      },
      { status: 500 }
    );
  }
}
