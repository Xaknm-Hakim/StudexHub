import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { requireUserId } from "@/src/lib/auth";
import { markToGradePoint } from "@/src/lib/grading/uthm";
import {
  getSemesterName,
  isValidSemesterSlot,
} from "@/src/lib/semester";

export async function GET() {
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

  return NextResponse.json({ courses });
}

export async function POST(req: Request) {
  const userId = await requireUserId();

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  const code = body.code ? String(body.code).trim() : null;
  const credit = Number(body.credit);
  const markRaw = body.mark;
  const semesterSlot = Number(body.semesterSlot);

  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  if (!Number.isInteger(credit) || credit <= 0) {
    return NextResponse.json(
      { error: "credit must be a positive integer" },
      { status: 400 }
    );
  }

  if (!isValidSemesterSlot(semesterSlot)) {
    return NextResponse.json(
      { error: "semesterSlot must be an integer from 0 to 5" },
      { status: 400 }
    );
  }

  let mark: number | null = null;
  let gradePoint: number | null = null;

  if (markRaw !== undefined && markRaw !== null && markRaw !== "") {
    const m = Number(markRaw);

    try {
      const res = markToGradePoint(m);
      mark = Math.floor(m);
      gradePoint = res.point;
    } catch (e: any) {
      return NextResponse.json(
        { error: e.message ?? "Invalid mark" },
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

  return NextResponse.json({ course }, { status: 201 });
}
