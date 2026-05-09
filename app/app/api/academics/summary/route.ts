import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { requireUserId } from "@/src/lib/auth";
import type { CourseRecord, SemesterRecord } from "@/src/lib/types/db";
import type { Summary } from "@/src/lib/types/summary";

const semesterSummarySelect = {
  id: true,
  name: true,
  year: true,
  courses: { select: { credit: true, gradePoint: true } },
} as const;

export async function GET() {
  const userId = await requireUserId();

  const semesters: Array<
    Pick<SemesterRecord, "id" | "name" | "year"> & {
      courses: Array<Pick<CourseRecord, "credit" | "gradePoint">>;
    }
  > = await prisma.semester.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    select: semesterSummarySelect,
  });

  const semesterStats = semesters.map((s) => {
    const valid = s.courses.filter((c) => c.gradePoint !== null);
    const credits = valid.reduce((sum, c) => sum + c.credit, 0);
    const quality = valid.reduce((sum, c) => sum + c.credit * (c.gradePoint as number), 0);
    const gpa = credits === 0 ? null : quality / credits;
    return { semesterId: s.id, name: s.name, year: s.year, gpa, credits };
  });

  const allValid = semesters.flatMap((s) =>
    s.courses
      .filter((c) => c.gradePoint !== null)
      .map((c) => ({ credit: c.credit, gp: c.gradePoint as number }))
  );

  const totalCredits = allValid.reduce((sum, c) => sum + c.credit, 0);
  const totalQuality = allValid.reduce((sum, c) => sum + c.credit * c.gp, 0);
  const cgpa = totalCredits === 0 ? null : totalQuality / totalCredits;

  const summary: Summary = { cgpa, totalCredits, semesterStats };

  return NextResponse.json(summary);
}
