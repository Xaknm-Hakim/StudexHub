import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { requireUserId } from "@/src/lib/auth";
import { markToGradePoint } from "@/src/lib/grading/uthm";
import { getErrorMessage } from "@/src/lib/types/common";

type RouteContext = {
  params: Promise<{ semesterId: string }>;
};

type CreateSemesterCourseBody = {
  name?: unknown;
  code?: unknown;
  credit?: unknown;
  mark?: unknown;
};

export async function POST(req: Request, ctx: RouteContext) {
  try {
    const userId = await requireUserId();
    const { semesterId } = await ctx.params;

    const body = (await req.json().catch(() => null)) as CreateSemesterCourseBody | null;

    if (!body) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid JSON",
        },
        { status: 400 }
      );
    }

    const name = String(body.name ?? "").trim();
    const code = body.code ? String(body.code).trim() : null;
    const credit = Number(body.credit);
    const markRaw = body.mark;

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          error: "name is required",
        },
        { status: 400 }
      );
    }

    if (!Number.isInteger(credit) || credit <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "credit must be a positive integer",
        },
        { status: 400 }
      );
    }

    const semester = await prisma.semester.findFirst({
      where: {
        id: semesterId,
        userId,
      },
      select: {
        id: true,
      },
    });

    if (!semester) {
      return NextResponse.json(
        {
          success: false,
          error: "Semester not found",
        },
        { status: 404 }
      );
    }

    let mark: number | null = null;
    let gradePoint: number | null = null;

    if (markRaw !== undefined && markRaw !== null && markRaw !== "") {
      const parsedMark = Number(markRaw);

      if (!Number.isFinite(parsedMark) || parsedMark < 0 || parsedMark > 100) {
        return NextResponse.json(
          {
            success: false,
            error: "mark must be between 0 and 100",
          },
          { status: 400 }
        );
      }

      try {
        const result = markToGradePoint(parsedMark);
        mark = Math.floor(parsedMark);
        gradePoint = result.point;
      } catch (error: unknown) {
        return NextResponse.json(
          {
            success: false,
            error: getErrorMessage(error),
          },
          { status: 400 }
        );
      }
    }

    const course = await prisma.course.create({
      data: {
        semesterId,
        name,
        code,
        credit,
        mark,
        gradePoint,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: course,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = getErrorMessage(error);

    if (message === "UNAUTHORIZED") {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create course",
      },
      { status: 500 }
    );
  }
}
