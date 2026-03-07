import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { requireUserId } from "@/src/lib/auth";
import { markToGradePoint } from "@/src/lib/grading/uthm";
import {
  getSemesterName,
  isValidSemesterSlot,
} from "@/src/lib/semester";

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ courseId: string }> }
) {
  const userId = await requireUserId();
  const { courseId } = await ctx.params;

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const existingCourse = await prisma.course.findFirst({
    where: {
      id: courseId,
      semester: { userId },
    },
    select: {
      id: true,
    },
  });

  if (!existingCourse) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  const data: {
    name?: string;
    code?: string | null;
    credit?: number;
    mark?: number | null;
    gradePoint?: number | null;
    semesterId?: string;
  } = {};

  if (body.name !== undefined) {
    const name = String(body.name).trim();
    if (!name) {
      return NextResponse.json(
        { error: "name cannot be empty" },
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
        { error: "credit must be a positive integer" },
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
      const m = Number(body.mark);

      try {
        const res = markToGradePoint(m);
        data.mark = Math.floor(m);
        data.gradePoint = res.point;
      } catch (e: any) {
        return NextResponse.json(
          { error: e.message ?? "Invalid mark" },
          { status: 400 }
        );
      }
    }
  }

  if (body.semesterSlot !== undefined) {
    const semesterSlot = Number(body.semesterSlot);

    if (!isValidSemesterSlot(semesterSlot)) {
      return NextResponse.json(
        { error: "semesterSlot must be an integer from 0 to 5" },
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

  return NextResponse.json({ course });
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ courseId: string }> }
) {
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
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  await prisma.course.delete({
    where: { id: courseId },
  });

  return NextResponse.json({ success: true });
}
