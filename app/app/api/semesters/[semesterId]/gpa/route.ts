import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { requireUserId } from "@/src/lib/auth";
import type { ApiResponse, SemesterGpaResponse } from "@/src/lib/types/api";
import { getErrorMessage } from "@/src/lib/types/common";

type RouteContext = {
  params: Promise<{ semesterId: string }>;
};

export async function GET(_req: Request, ctx: RouteContext) {
  try {
    const userId = await requireUserId();
    const { semesterId } = await ctx.params;

    const semester = await prisma.semester.findFirst({
      where: { id: semesterId, userId },
      select: {
        id: true,
        name: true,
        courses: {
          select: {
            credit: true,
            gradePoint: true,
            mark: true,
          },
        },
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

    const valid = semester.courses.filter((c) => c.gradePoint !== null);

    const totalCredits = valid.reduce((sum, c) => sum + c.credit, 0);
    const totalQuality = valid.reduce(
      (sum, c) => sum + c.credit * (c.gradePoint as number),
      0
    );

    const gpa = totalCredits === 0 ? null : totalQuality / totalCredits;

    const data: SemesterGpaResponse = {
      semesterId: semester.id,
      semesterName: semester.name,
      gpa,
      totalCredits,
      countedCourses: valid.length,
      totalCourses: semester.courses.length,
    };

    return NextResponse.json<ApiResponse<SemesterGpaResponse>>(
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
        error: "Failed to fetch semester GPA",
      },
      { status: 500 }
    );
  }
}
