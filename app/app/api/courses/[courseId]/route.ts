import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { requireUserId } from "@/src/lib/auth";
import { markToGradePoint } from "@/src/lib/grading/uthm";
import { getSemesterName, isValidSemesterSlot } from "@/src/lib/semester";
import type {
  ApiResponse,
  CourseWithSemester,
} from "@/src/lib/types/api";
import type { UpdateCourseBody } from "@/src/lib/types/requests";
import { getErrorMessage } from "@/src/lib/types/common";

type RouteContext = {
  params: Promise<{ courseId: string }>;
};

type CoursePatchBody = UpdateCourseBody & {
  semesterSlot?: number | string;
};

type DeleteCourseResult = {
  id: string;
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

export async function PATCH(req: Request, ctx: RouteContext) {
  try {
    const userId = await requireUserId();
    const { courseId } = await ctx.params;

    const body: CoursePatchBody | null = await req
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

    const existingCourse = await prisma.course.findFirst({
      where: {
        id: courseId,
        semester: { userId },
      },
      select: { id: true },
    });

    if (!existingCourse) {
      return NextResponse.json<ApiResponse<never>>(
        {
          ok: false,
          error: "Course not found",
        },
        { status: 404 }
      );
    }

    const data: any = {};

    if (body.name !== undefined) {
      const name = String(body.name).trim();

      if (!name) {
        return NextResponse.json<ApiResponse<never>>(
          {
            ok: false,
            error: "name cannot be empty",
          },
          { status: 400 }
        );
      }

      data.name = name;
    }

    if (body.code !== undefined) {
      data.code = body.code ? String(body.code).trim() : null;
    }

    if (body.credit !== undefined) {
      const credit = Number(body.credit);

      if (!Number.isInteger(credit) || credit <= 0) {
        return NextResponse.json<ApiResponse<never>>(
          {
            ok: false,
            error: "credit must be a positive integer",
          },
          { status: 400 }
        );
      }

      data.credit = credit;
    }

    if (body.mark !== undefined) {
      if (body.mark === null || body.mark === "") {
        data.mark = null;
        data.gradePoint = null;
      } else {
        const mark = Number(body.mark);

        if (!Number.isFinite(mark) || mark < 0 || mark > 100) {
          return NextResponse.json<ApiResponse<never>>(
            {
              ok: false,
              error: "mark must be between 0 and 100",
            },
            { status: 400 }
          );
        }

        try {
          const result = markToGradePoint(mark);
          data.mark = Math.floor(mark);
          data.gradePoint = result.point;
        } catch (error: unknown) {
          return NextResponse.json<ApiResponse<never>>(
            {
              ok: false,
              error: getErrorMessage(error) || "Invalid mark",
            },
            { status: 400 }
          );
        }
      }
    }

    if (body.semesterSlot !== undefined) {
      const semesterSlot = Number(body.semesterSlot);

      if (!isValidSemesterSlot(semesterSlot)) {
        return NextResponse.json<ApiResponse<never>>(
          {
            ok: false,
            error: "semesterSlot must be an integer from 0 to 5",
          },
          { status: 400 }
        );
      }

      let semester = await prisma.semester.findFirst({
        where: { userId, slot: semesterSlot },
      });

      if (!semester) {
        semester = await prisma.semester.create({
          data: {
            userId,
            slot: semesterSlot,
            name: getSemesterName(semesterSlot),
          },
        });
      }

      data.semesterId = semester.id;
    }

    if (body.semesterId !== undefined) {
      const semester = await prisma.semester.findFirst({
        where: {
          id: body.semesterId,
          userId,
        },
        select: { id: true },
      });

      if (!semester) {
        return NextResponse.json<ApiResponse<never>>(
          {
            ok: false,
            error: "Invalid semesterId",
          },
          { status: 400 }
        );
      }

      data.semesterId = semester.id;
    }

    const course = await prisma.course.update({
      where: { id: courseId },
      data,
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
        error: "Failed to update course",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: Request, ctx: RouteContext) {
  try {
    const userId = await requireUserId();
    const { courseId } = await ctx.params;

    const existingCourse = await prisma.course.findFirst({
      where: {
        id: courseId,
        semester: { userId },
      },
      select: { id: true },
    });

    if (!existingCourse) {
      return NextResponse.json<ApiResponse<never>>(
        {
          ok: false,
          error: "Course not found",
        },
        { status: 404 }
      );
    }

    await prisma.course.delete({
      where: { id: courseId },
    });

    return NextResponse.json<ApiResponse<DeleteCourseResult>>(
      {
        ok: true,
        data: { id: courseId },
        message: "Course deleted successfully",
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
        error: "Failed to delete course",
      },
      { status: 500 }
    );
  }
}
