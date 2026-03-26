import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { requireUserId } from "@/src/lib/auth";
import { markToGradePoint } from "@/src/lib/grading/uthm";
import { getSemesterName, isValidSemesterSlot } from "@/src/lib/semester";
import type { CreateCourseBody } from "@/src/lib/types/requests";
import { getErrorMessage } from "@/src/lib/types/common";

export async function GET() {
  try {
    const userId = await requireUserId();

    const courses = await prisma.course.findMany({
      where: {
        semester: {
          userId,
        },
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: courses,
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
        error: "Failed to fetch courses",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const userId = await requireUserId();

    const body = (await req.json().catch(() => null)) as
      | (CreateCourseBody & { semesterSlot?: number | string; mark?: number | string | null })
      | null;

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
    const semesterSlot = Number(body.semesterSlot);

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

    if (!isValidSemesterSlot(semesterSlot)) {
      return NextResponse.json(
        {
          success: false,
          error: "semesterSlot must be an integer from 0 to 5",
        },
        { status: 400 }
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
            error: getErrorMessage(error) || "Invalid mark",
          },
          { status: 400 }
        );
      }
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

    const course = await prisma.course.create({
      data: {
        semesterId: semester.id,
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
