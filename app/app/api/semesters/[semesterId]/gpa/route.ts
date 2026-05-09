import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { requireUserId } from "@/src/lib/auth";
import type { CourseRecord, SemesterRecord } from "@/src/lib/types/db";

type SemesterGpaRow = Pick<SemesterRecord, "id" | "name"> & {
  courses: Array<Pick<CourseRecord, "credit" | "gradePoint" | "mark">>;
};

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ semesterId: string }> }
) {
  const userId = await requireUserId();
  const { semesterId } = await ctx.params;

  const semester: SemesterGpaRow | null = await prisma.semester.findFirst({
    where: { id: semesterId, userId },
    select: {
      id: true,
      name: true,
      courses: { select: { credit: true, gradePoint: true, mark: true } },
    },
  });

  if (!semester) return NextResponse.json({ error: "Semester not found" }, { status: 404 });

  const valid = semester.courses.filter((c) => c.gradePoint !== null);

  const totalCredits = valid.reduce((s, c) => s + c.credit, 0);
  const totalQuality = valid.reduce((s, c) => s + c.credit * (c.gradePoint as number), 0);

  const gpa = totalCredits === 0 ? null : totalQuality / totalCredits;

  return NextResponse.json({
    semesterId: semester.id,
    semesterName: semester.name,
    gpa,
    totalCredits,
    countedCourses: valid.length,
    totalCourses: semester.courses.length,
  });
}
