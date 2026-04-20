import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { requireUserId } from "@/src/lib/auth";
import { markToGradePoint } from "@/src/lib/grading/uthm";
import { getSemesterName, isValidSemesterSlot } from "@/src/lib/semester";
import type { ApiResponse, CourseWithSemester } from "@/src/lib/types/api";
import type { CreateCourseBody } from "@/src/lib/types/requests";
import { getErrorMessage } from "@/src/lib/types/common";

type CreateCourseRequest = CreateCourseBody & {
  semesterSlot?: number | string;
  mark?: number | string | null;
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

    const responseCourses: CourseWithSemester[] = courses.map((course) =>
      toCourseWithSemesterResponse(course)
    );

    return NextResponse.json<ApiResponse<CourseWithSemester[]>>(
      {
        ok: true,
        data: responseCourses,
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
        error: "Failed to fetch courses",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const userId = await requireUserId();

    const body: CreateCourseRequest | null = await req
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
    const semesterSlot = Number(body.semesterSlot);

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

    if (!isValidSemesterSlot(semesterSlot)) {
      return NextResponse.json<ApiResponse<never>>(
        {
          ok: false,
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

    const responseCourse: CourseWithSemester =
      toCourseWithSemesterResponse(course);

    return NextResponse.json<ApiResponse<CourseWithSemester>>(
      {
        ok: true,
        data: responseCourse,
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
