import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { requireUserId } from "@/src/lib/auth";
import type { ApiResponse, AcademicSummaryResponse } from "@/src/lib/types/api";
import { getErrorMessage } from "@/src/lib/types/common";

export async function GET() {
  try {
    const userId = await requireUserId();

    const semesters = await prisma.semester.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        name: true,
        year: true,
        courses: {
          select: {
            credit: true,
            gradePoint: true,
          },
        },
      },
    });

    const semesterStats: AcademicSummaryResponse["semesterStats"] = semesters.map((s) => {
      const valid = s.courses.filter((c) => c.gradePoint !== null);
      const credits = valid.reduce((sum, c) => sum + c.credit, 0);
      const quality = valid.reduce(
        (sum, c) => sum + c.credit * (c.gradePoint as number),
        0
      );
      const gpa = credits === 0 ? null : quality / credits;

      return {
        semesterId: s.id,
        name: s.name,
        year: s.year,
        gpa,
        credits,
      };
    });

    const allValid = semesters.flatMap((s) =>
      s.courses
        .filter((c) => c.gradePoint !== null)
        .map((c) => ({ credit: c.credit, gp: c.gradePoint as number }))
    );

    const totalCredits = allValid.reduce((sum, c) => sum + c.credit, 0);
    const totalQuality = allValid.reduce((sum, c) => sum + c.credit * c.gp, 0);
    const cgpa = totalCredits === 0 ? null : totalQuality / totalCredits;

    const data: AcademicSummaryResponse = {
      cgpa,
      totalCredits,
      semesterStats,
    };

    return NextResponse.json<ApiResponse<AcademicSummaryResponse>>(
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
        error: "Failed to fetch academic summary",
      },
      { status: 500 }
    );
  }
}
