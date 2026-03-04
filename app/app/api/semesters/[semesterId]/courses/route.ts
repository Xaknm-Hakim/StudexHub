import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { requireUserId } from "@/src/lib/auth";
import { markToGradePoint } from "@/src/lib/grading/uthm";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ semesterId: string }> }
) {
  const userId = await requireUserId();
  const { semesterId } = await ctx.params;

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const name = String(body.name ?? "").trim();
  const code = body.code ? String(body.code).trim() : null;
  const credit = Number(body.credit);
  const markRaw = body.mark;

  if (!name) return NextResponse.json({ error: "name is required" }, { status: 400 });
  if (!Number.isInteger(credit) || credit <= 0) {
    return NextResponse.json({ error: "credit must be a positive integer" }, { status: 400 });
  }

  // Ownership check
  const semester = await prisma.semester.findFirst({
    where: { id: semesterId, userId },
    select: { id: true },
  });
  if (!semester) return NextResponse.json({ error: "Semester not found" }, { status: 404 });

  let mark: number | null = null;
  let gradePoint: number | null = null;

  if (markRaw !== undefined && markRaw !== null && markRaw !== "") {
    const m = Number(markRaw);
    try {
      const res = markToGradePoint(m);
      mark = Math.floor(m);
      gradePoint = res.point;
    } catch (e: any) {
      return NextResponse.json({ error: e.message ?? "Invalid mark" }, { status: 400 });
    }
  }

  const course = await prisma.course.create({
    data: {
      semesterId, // <-- now this is defined
      name,
      code,
      credit,
      mark,
      gradePoint,
    },
  });

  return NextResponse.json({ course }, { status: 201 });
}
