import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { requireUserId } from "@/src/lib/auth";
import { markToGradePoint } from "@/src/lib/grading/uthm";
import { getSemesterName, isValidSemesterSlot } from "@/src/lib/semester";
import type { UpdateCourseBody } from "@/src/lib/types/requests";
import { getErrorMessage } from "@/src/lib/types/common";

type RouteContext = {
  params: Promise<{ courseId: string }>;
};

type CourseUpdateData = {
  name?: string;
  code?: string | null;
  credit?: number;
  mark?: number | null;
  gradePoint?: number | null;
  semesterId?: string;
};

type CoursePatchBody = UpdateCourseBody & {
  semesterSlot?: number | string;
};

export async function PATCH(req: Request, ctx: RouteContext) {
  try {
    const userId = await requireUserId();
    const { courseId } = await ctx.params;

    const body = (await req.json().catch(() => null)) as CoursePatchBody | null;

    if (!body) {
      return NextResponse.json(
        {
          success: false,
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
      return NextResponse.json(
        {
          success: false,
          error: "Course not found",
        },
        { status: 404 }
      );
    }

    const data: CourseUpdateData = {};

    if (body.name !== undefined) {
      const name = String(body.name).trim();

      if (!name) {
        return NextResponse.json(
          {
            success: false,
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
        return NextResponse.json(
          {
            success: false,
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
          return NextResponse.json(
            {
              success: false,
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
          return NextResponse.json(
            {
              success: false,
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
        return NextResponse.json(
          {
            success: false,
            error: "semesterSlot must be an integer from 0 to 5",
          },
          { status: 400 }
        );
      }

      let semester = await prisma.semester.findFirst({
        where: {
          userId,
          slot: semesterSlot,
        },
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
        return NextResponse.json(
          {
            success: false,
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

    return NextResponse.json({
      success: true,
      data: course,
    });
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
      return NextResponse.json(
        {
          success: false,
          error: "Course not found",
        },
        { status: 404 }
      );
    }

    await prisma.course.delete({
      where: { id: courseId },
    });

    return NextResponse.json({
      success: true,
      data: null,
      message: "Course deleted successfully",
    });
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
        error: "Failed to delete course",
      },
      { status: 500 }
    );
  }
}
