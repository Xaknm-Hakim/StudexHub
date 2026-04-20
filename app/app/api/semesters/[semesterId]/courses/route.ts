import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { requireUserId } from "@/src/lib/auth";
import { markToGradePoint } from "@/src/lib/grading/uthm";
import type { ApiResponse, CourseWithSemester } from "@/src/lib/types/api";
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

function toCourseWithSemesterResponse(course: {
  id: string;
  semesterId: string;
  code: string | null;
  name: string;
  credit: number;
  mark: number | null;
  gradePoint: number | null;
  createdAt: Date;
  updatedAt: Date;
  semester: {
    id: string;
    slot: number;
    name: string;
  };
}): CourseWithSemester {
  return {
    id: course.id,
    semesterId: course.semesterId,
    code: course.code,
    name: course.name,
    credit: course.credit,
    mark: course.mark,
    gradePoint: course.gradePoint,
    createdAt: course.createdAt.toISOString(),
    updatedAt: course.updatedAt.toISOString(),
    semester: {
      id: course.semester.id,
      slot: course.semester.slot,
      name: course.semester.name,
    },
  };
}

export async function POST(req: Request, ctx: RouteContext) {
  try {
    const userId = await requireUserId();
    const { semesterId } = await ctx.params;

    const body: CreateSemesterCourseBody | null = await req
      .json()
      .catch(() => null);

    if (!body) {
      return NextResponse.json<ApiResponse<never>>(
        {
          ok: false,
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
      return NextResponse.json<ApiResponse<never>>(
        {
          ok: false,
          error: "name is required",
        },
        { status: 400 }
      );
    }

    if (!Number.isInteger(credit) || credit <= 0) {
      return NextResponse.json<ApiResponse<never>>(
        {
          ok: false,
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
        slot: true,
        name: true,
      },
    });

    if (!semester) {
      return NextResponse.json<ApiResponse<never>>(
        {
          ok: false,
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
        return NextResponse.json<ApiResponse<never>>(
          {
            ok: false,
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
        return NextResponse.json<ApiResponse<never>>(
          {
            ok: false,
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
      include: {
        semester: {
          select: {
            id: true,
            slot: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json<ApiResponse<CourseWithSemester>>(
      {
        ok: true,
        data: toCourseWithSemesterResponse(course),
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
        error: "Failed to create course",
      },
      { status: 500 }
    );
  }
}
